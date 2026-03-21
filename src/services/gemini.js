const WORKER_URL = import.meta.env.VITE_WORKER_URL;

export async function queryAI({ idToken, prompt, currentYear, countryList }) {
  if (!WORKER_URL) {
    throw new Error('VITE_WORKER_URL is not configured');
  }

  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify({ prompt, currentYear, countryList }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  const data = await res.json();
  return formatResult(data);
}

function formatResult(parsed) {
  const overrides = {};
  for (const [country, style] of Object.entries(parsed.countries || {})) {
    overrides[country] = style;
  }
  return {
    narrative: parsed.narrative || 'Scenario applied.',
    overrides,
    legend: parsed.legend || null,
  };
}
