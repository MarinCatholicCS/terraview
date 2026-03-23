// --- CORS ---
function getCorsHeaders(request, env) {
  const origin = (request.headers.get('Origin') || '').replace(/\/+$/, '');
  const allowed = (env.ALLOWED_ORIGIN || '').replace(/\/+$/, '');
  const isAllowed =
    origin === allowed ||
    origin.startsWith('http://localhost:') ||
    origin === 'http://localhost';
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : '',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// --- Rate Limiting (in-memory, per-isolate) ---
const rateLimitMap = new Map();
const RATE_LIMIT_MS = 15000;

function checkRateLimit(uid) {
  const now = Date.now();
  const last = rateLimitMap.get(uid);
  if (last && now - last < RATE_LIMIT_MS) return false;
  rateLimitMap.set(uid, now);
  // Prune old entries periodically
  if (rateLimitMap.size > 1000) {
    for (const [key, ts] of rateLimitMap) {
      if (now - ts > RATE_LIMIT_MS) rateLimitMap.delete(key);
    }
  }
  return true;
}

// --- Main Handler ---
export default {
  async fetch(request, env) {
    const corsHeaders = getCorsHeaders(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405, corsHeaders);
    }

    try {
      // 1. Verify Firebase ID token
      const authHeader = request.headers.get('Authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return jsonResponse({ error: 'Missing authorization token' }, 401, corsHeaders);
      }

      const idToken = authHeader.slice(7);
      const payload = await verifyFirebaseToken(idToken, env.FIREBASE_PROJECT_ID);
      const uid = payload.sub;

      // 2. Rate limit per user
      if (!checkRateLimit(uid)) {
        return jsonResponse({ error: 'Rate limited — please wait before simulating again' }, 429, corsHeaders);
      }

      // 3. Deduct credit (atomic, server-side)
      const accessToken = await getGoogleAccessToken(
        env.FIREBASE_SERVICE_ACCOUNT_EMAIL,
        env.FIREBASE_SERVICE_ACCOUNT_KEY
      );
      const creditsRemaining = await deductCredit(accessToken, env.FIREBASE_PROJECT_ID, uid);

      // 4. Parse request body
      const { prompt, currentYear, countryNames } = await request.json();
      if (!prompt) {
        // Refund since we already deducted
        await refundCredit(accessToken, env.FIREBASE_PROJECT_ID, uid).catch(() => {});
        return jsonResponse({ error: 'Missing prompt' }, 400, corsHeaders);
      }

      // 5. Call Claude API
      let result;
      try {
        result = await callClaude(env.ANTHROPIC_API_KEY, prompt, currentYear, countryNames);
      } catch (claudeErr) {
        // Refund credit if Claude call fails
        await refundCredit(accessToken, env.FIREBASE_PROJECT_ID, uid).catch(() => {});
        throw claudeErr;
      }

      // 6. Return result with remaining credits
      result.creditsRemaining = creditsRemaining;
      return jsonResponse(result, 200, corsHeaders);
    } catch (err) {
      const status = (err && err.status) ? err.status : 500;
      const message = (err && err.message) ? err.message : 'Internal error';
      return jsonResponse({ error: message }, status, corsHeaders);
    }
  },
};

// --- Google Service Account Auth ---
async function getGoogleAccessToken(email, privateKeyPem) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: email,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const enc = new TextEncoder();
  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const claimsB64 = base64UrlEncode(JSON.stringify(claimSet));
  const signingInput = `${headerB64}.${claimsB64}`;

  // Import the private key
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(privateKeyPem),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, enc.encode(signingInput));
  const signatureB64 = base64UrlEncode(signature);
  const jwt = `${signingInput}.${signatureB64}`;

  // Exchange JWT for access token
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  if (!res.ok) {
    const err = await res.text();
    throw createError(`Service account auth failed: ${err}`, 500);
  }

  const data = await res.json();
  return data.access_token;
}

function pemToArrayBuffer(pem) {
  const lines = pem.replace(/\\n/g, '\n').split('\n');
  const base64 = lines.filter((l) => !l.startsWith('-----')).join('');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function base64UrlEncode(input) {
  let str;
  if (typeof input === 'string') {
    str = btoa(input);
  } else {
    // ArrayBuffer
    const bytes = new Uint8Array(input);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    str = btoa(binary);
  }
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// --- Firestore Credit Management ---
const FIRESTORE_BASE = 'https://firestore.googleapis.com/v1';

function firestoreDocUrl(projectId, uid) {
  return `${FIRESTORE_BASE}/projects/${projectId}/databases/(default)/documents/users/${uid}`;
}

async function deductCredit(accessToken, projectId, uid) {
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
  const dbPath = `projects/${projectId}/databases/(default)`;

  // Begin transaction
  const txnRes = await fetch(`${FIRESTORE_BASE}/${dbPath}/documents:beginTransaction`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ options: { readWrite: {} } }),
  });
  if (!txnRes.ok) throw createError('Failed to begin Firestore transaction', 500);
  const { transaction } = await txnRes.json();

  // Read user doc within transaction
  const docUrl = firestoreDocUrl(projectId, uid);
  const getRes = await fetch(`${docUrl}?transaction=${encodeURIComponent(transaction)}`, { headers });

  let credits = 0;
  if (getRes.ok) {
    const doc = await getRes.json();
    if (doc.fields && doc.fields.credits && doc.fields.credits.integerValue !== undefined) {
      credits = parseInt(doc.fields.credits.integerValue, 10);
    }
  } else if (getRes.status === 404) {
    // User doc doesn't exist — no credits
    credits = 0;
  } else {
    throw createError('Failed to read user credits', 500);
  }

  if (credits <= 0) {
    // Rollback transaction
    await fetch(`${FIRESTORE_BASE}/${dbPath}/documents:rollback`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ transaction }),
    }).catch(() => {});
    throw createError('No simulations remaining', 403);
  }

  // Commit with decremented credits
  const newCredits = credits - 1;
  const commitRes = await fetch(`${FIRESTORE_BASE}/${dbPath}/documents:commit`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      transaction,
      writes: [{
        update: {
          name: `${dbPath}/documents/users/${uid}`,
          fields: {
            credits: { integerValue: String(newCredits) },
          },
        },
        updateMask: { fieldPaths: ['credits'] },
      }],
    }),
  });

  if (!commitRes.ok) {
    const err = await commitRes.text();
    throw createError(`Credit deduction failed: ${err}`, 500);
  }

  return newCredits;
}

async function refundCredit(accessToken, projectId, uid) {
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
  const dbPath = `projects/${projectId}/databases/(default)`;

  // Read current credits
  const docUrl = firestoreDocUrl(projectId, uid);
  const getRes = await fetch(docUrl, { headers });
  if (!getRes.ok) return;

  const doc = await getRes.json();
  const current = doc.fields?.credits?.integerValue
    ? parseInt(doc.fields.credits.integerValue, 10)
    : 0;

  // Write incremented value
  await fetch(`${FIRESTORE_BASE}/${dbPath}/documents:commit`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      writes: [{
        update: {
          name: `${dbPath}/documents/users/${uid}`,
          fields: {
            credits: { integerValue: String(current + 1) },
          },
        },
        updateMask: { fieldPaths: ['credits'] },
      }],
    }),
  });
}

// --- Firebase Token Verification ---
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

// --- Claude API ---
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
7. ALWAYS use modern/present-day country names in the output, even when the scenario involves historical entities. For example, use "Russia" not "USSR" or "Soviet Union", use "Germany" not "West Germany" or "East Germany", use "Czechia" not "Czechoslovakia", use "Ethiopia" not "Abyssinia". The map only has modern borders — historical names will not match any country and will be silently ignored.

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

// --- JSON Parsing ---
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

// --- Utilities ---
class HttpError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

function createError(message, status) {
  return new HttpError(message, status);
}

function jsonResponse(data, status = 200, corsHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}
