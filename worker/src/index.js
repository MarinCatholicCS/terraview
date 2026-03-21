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

      // 3. Call Claude API
      const result = await callClaude(env.ANTHROPIC_API_KEY, prompt, currentYear, countryList);
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

async function callClaude(apiKey, prompt, currentYear, countryList) {
  const systemPrompt = `You are a hypothetical impact simulator for TerraView. Given a hypothetical scenario, trace its cascading consequences forward through history to the present day (${currentYear}).

Your job: show what the MODERN world map would look like TODAY if this hypothetical had actually happened. Use present-day country names and borders as the baseline, then recolor them based on how this scenario would have reshaped geopolitics by now.

CRITICAL RULES — follow these without exception:
1. Think in cascading consequences across decades and centuries. A single divergence point reshapes the entire trajectory of history. Trace the chain reaction all the way to the modern day.
2. The scenario's dominant power or ideology MUST have spread, evolved, or influenced a large number of modern countries by ${currentYear}. Show successor states, ideological blocs, and spheres of influence as they would exist TODAY.
3. Countries aligned with the dominant power get its color. Vassal/satellite states get brown. Resistant coalitions get steel blue. Show how alliances and rivalries would have evolved.
4. Ripple effects compound over time: economic dependencies shift, alliances form and break, ideologies spread or collapse. Show these modern-day consequences on the map.
5. Include ALL countries meaningfully affected — typically 60-180 countries for world-spanning scenarios. If a superpower or ideology rose, most of the world is affected by ${currentYear}.
6. Never leave a country on its default color if the scenario plausibly touches it.
7. Be dramatic and historically creative. Trace the butterflies — small changes compound into massive modern-day differences.

Available country names from the dataset: ${countryList}

Color palette:
- #b5451b (rust/red) for the dominant power's core territories and successor states
- #4a6fa5 (steel blue) for resisting coalitions and democratic opposition blocs
- #5a8a5a (muted green) for neutral states far from the conflict (use sparingly)
- #8a6a4a (earth brown) for satellite states, occupied territories, or vassal nations
- #c9973a (gold) for rising/opportunist powers that exploited the altered timeline
- #7a4a8a (purple) for collapsed or balkanized former empires
- #3a6a5a (teal) for secondary allied blocs or puppet states

Example: "What if Hitler won WW2?" → In ${currentYear}: Greater Germanic Reich controls Central Europe (#b5451b), satellite states across Eastern Europe (#8a6a4a), a cold-war-style democratic resistance bloc in the Americas and UK (#4a6fa5), Japanese co-prosperity sphere across East Asia (#c9973a), collapsed Soviet successor states (#7a4a8a), neutral holdouts in South America (#5a8a5a). Almost no country is untouched by ${currentYear}.

You MUST respond with ONLY a JSON object — no markdown, no code fences, no explanation before or after. Just the raw JSON.`;

  const userMessage = `Scenario: "${prompt}"

Respond with a JSON object in this exact format:
{
  "narrative": "3-4 sentence vivid description of how this hypothetical reshaped history and what the modern world (${currentYear}) looks like as a result",
  "countries": {
    "Country Name": { "color": "#hexcolor", "opacity": 0.65, "group": "faction name" }
  },
  "legend": [
    { "color": "#hexcolor", "label": "Faction Name" }
  ]
}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16384,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Claude API error: HTTP ${res.status}`);
  }

  const data = await res.json();

  if (data.stop_reason && data.stop_reason !== 'end_turn' && data.stop_reason !== 'max_tokens') {
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
