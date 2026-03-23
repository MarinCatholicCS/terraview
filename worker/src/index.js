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
      const { prompt, currentYear, countryNames } = await request.json();
      if (!prompt) {
        return jsonResponse({ error: 'Missing prompt' }, 400);
      }

      // 3. Call Claude API
      const result = await callClaude(env.ANTHROPIC_API_KEY, prompt, currentYear, countryNames);
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

async function callClaude(apiKey, prompt, currentYear, countryNames) {
  const systemPrompt = `You are a hypothetical impact simulator for TerraView. Given a hypothetical scenario, trace its cascading consequences forward through history to the present day (${currentYear}).

Your job: show what the MODERN world map would look like TODAY if this hypothetical had actually happened. Use present-day country names and borders as the baseline, then recolor them based on how this scenario would have reshaped geopolitics by now.

CRITICAL RULES:
1. Trace cascading consequences across decades/centuries to the modern day.
2. The scenario's dominant power or ideology MUST influence a large number of modern countries by ${currentYear}. Show successor states, ideological blocs, and spheres of influence as they exist TODAY.
3. Countries aligned with the dominant power get its color. Vassal/satellite states get brown. Resistant coalitions get steel blue.
4. You MUST assign a color to EVERY country in the provided country list. No country should be left out.
5. Use ONLY the exact country names provided in the country list — do not rename, abbreviate, or modify them.
6. Be dramatic and historically creative.

Color palette:
- #b5451b (rust/red) — dominant power's core territories and successor states
- #4a6fa5 (steel blue) — resisting coalitions and democratic opposition blocs
- #5a8a5a (muted green) — neutral states far from the conflict (use sparingly)
- #8a6a4a (earth brown) — satellite states, occupied territories, or vassal nations
- #c9973a (gold) — rising/opportunist powers that exploited the altered timeline
- #7a4a8a (purple) — collapsed or balkanized former empires
- #3a6a5a (teal) — secondary allied blocs or puppet states

Also generate a cascading events tree showing the chain of consequences from the divergence point to the modern day. The tree must have 3-4 levels deep maximum and 2-3 branches per node maximum. Each node has an "event" string (concise, under 60 characters) and a "year" number. The root node is the original divergence event.

You MUST respond with ONLY a JSON object — no markdown, no code fences, no explanation.`;

  const countryListStr = Array.isArray(countryNames) && countryNames.length > 0
    ? `\n\nCountry list (use these EXACT names as keys in the "countries" object):\n${countryNames.join(', ')}`
    : '';

  const userMessage = `Scenario: "${prompt}"${countryListStr}

JSON format:
{"narrative":"3-4 sentences","events":{"event":"divergence","year":1945,"children":[{"event":"consequence","year":1950,"children":[{"event":"effect","year":1970,"children":[]}]}]},"countries":{"Country Name":{"color":"#hex","opacity":0.65,"group":"faction"}},"legend":[{"color":"#hex","label":"Faction"}]}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 32768,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Claude API error: HTTP ${res.status}`);
  }

  const data = await res.json();

  if (data.stop_reason === 'max_tokens') {
    throw new Error('Response was truncated — scenario may be too complex. Try a simpler prompt.');
  }

  if (data.stop_reason && data.stop_reason !== 'end_turn') {
    throw new Error(`Claude stop reason: ${data.stop_reason}`);
  }

  const rawText = (data.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();

  if (!rawText) {
    throw new Error('Claude returned no text content');
  }

  return parseJson(rawText);
}

function parseJson(text) {
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // ignored — try brace matching
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

  throw new Error('Could not parse response: ' + cleaned.slice(0, 200));
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
