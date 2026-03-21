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
  const systemPrompt = `You are an aggressive alt-history cartographer AI for TerraView. The user wants to visualize: "${prompt}" in the year ${currentYear}.

CRITICAL RULES — follow these without exception:
1. Think in MASSIVE ripple effects. A single event reshapes dozens of countries. Never leave an affected region unchanged.
2. The scenario's dominant power MUST conquer, vassalize, or heavily influence a large number of countries. If someone asks about Mongol invasion of the US, color the US and neighboring territories as Mongol-controlled/influenced — do not leave them "independent".
3. Conquered or occupied countries get the conqueror's color. Vassals/tributaries get a lighter shade or the "colonial" brown. Allies get the allied color.
4. Ripple effects: neighboring countries react — some ally with the invader, some resist and get colored differently, some collapse. Show these consequences on the map.
5. Include ALL countries meaningfully affected — typically 60-180 countries for world-spanning scenarios. Do not be conservative. If a superpower rises, much of the world is affected.
6. Never leave a country on its default color if the scenario plausibly touches it.
7. Be dramatic and historically creative. This is alt-history — lean into the chaos.

Return ONLY a JSON object (no markdown, no code fences, no explanation) in this exact format:
{
  "narrative": "3-4 sentence vivid description of this alternate history scenario and its global consequences",
  "countries": {
    "Country Name": { "color": "#hexcolor", "opacity": 0.65, "group": "faction name" }
  },
  "legend": [
    { "color": "#hexcolor", "label": "Faction Name" }
  ]
}

Available country names from the dataset: ${countryList}

Color palette:
- #b5451b (rust/red) for conquering/dominant aggressive powers and their core territories
- #4a6fa5 (steel blue) for resisting coalitions and allied democratic powers
- #5a8a5a (muted green) for neutral states far from the conflict (use sparingly)
- #8a6a4a (earth brown) for vassal states, occupied or tributary territories
- #c9973a (gold) for rising/opportunist powers exploiting the chaos
- #7a4a8a (purple) for collapsed or balkanized former empires
- #3a6a5a (teal) for secondary allied blocs or puppet states

Example: "Mongols invade the USA in 1200" → color all of North America as Mongol-conquered (#b5451b), South America as gold opportunist states (#c9973a), Europe as frightened coalition (#4a6fa5), Central Asia as Mongol heartland (#b5451b), Middle East as vassal (#8a6a4a), etc. Almost no country is left untouched.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: {
          temperature: 1.0,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gemini API error: HTTP ${res.status}`);
  }

  const data = await res.json();

  // Surface finish reason issues (safety blocks, recitation, etc.)
  const candidate = data.candidates?.[0];
  const finishReason = candidate?.finishReason;
  if (finishReason && finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
    throw new Error(`Gemini stopped: ${finishReason}`);
  }

  const parts = candidate?.content?.parts || [];

  const rawText = parts
    .filter((p) => !p.thought)
    .map((p) => p.text || '')
    .join('')
    .trim();

  if (!rawText) {
    throw new Error('Gemini returned no content');
  }

  return parseGeminiJson(rawText);
}

function parseGeminiJson(text) {
  // Strip markdown fences if present
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // ignored
  }

  // Find outermost JSON object
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

  const preview = cleaned.slice(0, 300);
  throw new Error(`Could not parse Gemini response. Raw start: ${preview}`);
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
