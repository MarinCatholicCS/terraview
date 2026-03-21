const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    try {
      // 1. Verify Firebase ID token
      const authHeader = request.headers.get('Authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return jsonResponse({ error: 'Missing authorization token' }, 401);
      }

      const idToken = authHeader.slice(7);
      await verifyFirebaseToken(idToken, env.FIREBASE_PROJECT_ID);

      // 2. Parse request body
      const { prompt, currentYear, countryList } = await request.json();
      if (!prompt) {
        return jsonResponse({ error: 'Missing prompt' }, 400);
      }

      // 3. Call Gemini API
      const result = await callGemini(env.GEMINI_API_KEY, prompt, currentYear, countryList);
      return jsonResponse(result);
    } catch (err) {
      const status = (err && err.status) ? err.status : 500;
      const message = (err && err.message) ? err.message : 'Internal error';
      return jsonResponse({ error: message }, status);
    }
  },
};

// Verify a Firebase ID token using Google's JWKS endpoint (RS256)
async function verifyFirebaseToken(token, projectId) {
  const parts = token.split('.');
  if (parts.length !== 3) throw createError('Invalid token format', 401);

  const header = JSON.parse(base64UrlDecode(parts[0]));
  const payload = JSON.parse(base64UrlDecode(parts[1]));

  // Validate claims
  const now = Math.floor(Date.now() / 1000);
  const pid = (projectId || '').trim();
  if (payload.exp < now) throw createError('Token expired', 401);
  if (payload.iat > now + 300) throw createError('Token issued in the future', 401);
  if (payload.aud !== pid) throw createError('Token audience mismatch: aud=' + payload.aud + ' expected=' + pid, 401);
  if (payload.iss !== `https://securetoken.google.com/${pid}`) throw createError('Token issuer mismatch', 401);
  if (!payload.sub) throw createError('Token missing subject', 401);

  // Fetch JWKS and find the matching key
  const jwksResponse = await fetch(
    'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
  );
  const jwks = await jwksResponse.json();
  const jwk = jwks.keys.find((k) => k.kid === header.kid);
  if (!jwk) throw createError('Unknown signing key', 401);

  // Import key and verify signature
  const key = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
  const signature = base64UrlToArrayBuffer(parts[2]);

  const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, signature, data);
  if (!valid) throw createError('Invalid token signature', 401);

  return payload;
}

function base64UrlDecode(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
  return atob(padded);
}

function base64UrlToArrayBuffer(base64url) {
  const binary = base64UrlDecode(base64url);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function callGemini(apiKey, prompt, currentYear, countryList) {
  const systemPrompt = `You are a historical cartographer AI for TerraView. The user wants to visualize: "${prompt}" in the year ${currentYear}.

Return ONLY a JSON object (no markdown, no code fences, no explanation) in this exact format:
{
  "narrative": "2-3 sentence description of this historical scenario",
  "countries": {
    "Country Name": { "color": "#hexcolor", "opacity": 0.6, "group": "faction name" }
  },
  "legend": [
    { "color": "#hexcolor", "label": "Faction Name" }
  ]
}

Available country names from the dataset: ${countryList}

Color palette:
- #b5451b (rust/red) for aggressive/dominant powers
- #4a6fa5 (steel blue) for democratic/allied powers
- #5a8a5a (muted green) for neutral/independent states
- #8a6a4a (earth brown) for colonial/occupied territories
- #c9973a (gold) for emerging/revolutionary powers
- #7a4a8a (purple) for ancient/fallen empires

Only include countries relevant to the scenario (max 40). Be historically informed but creative for alt-history.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gemini API error: HTTP ${res.status}`);
  }

  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts || [];

  const rawText = parts
    .filter((p) => !p.thought)
    .map((p) => p.text || '')
    .join('');

  const textToParse = rawText.trim() || parts.map((p) => p.text || '').join('');
  return parseGeminiJson(textToParse);
}

function parseGeminiJson(text) {
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // ignored
  }

  let depth = 0;
  let start = -1;
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (cleaned[i] === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        try {
          return JSON.parse(cleaned.slice(start, i + 1));
        } catch {
          // keep searching
        }
      }
    }
  }

  throw new Error('Could not parse Gemini response');
}

class HttpError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

function createError(message, status) {
  return new HttpError(message, status);
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}
