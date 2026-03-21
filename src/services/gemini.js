const WORKER_URL = import.meta.env.VITE_WORKER_URL;

export async function queryGemini({ prompt, currentYear, countryList }) {
  const systemPrompt = `You are a historical cartographer AI for TerraView. The user wants to visualize: "${prompt}" in the year ${currentYear}.

Return ONLY valid JSON in this exact format:
{
  "narrative": "2-3 sentence description of this historical scenario",
  "countries": {
    "Country Name": { "color": "#hexcolor", "opacity": 0.6, "group": "faction name" },
    ...
  },
  "legend": [
    { "color": "#hexcolor", "label": "Faction Name" },
    ...
  ]
}

Use these exact country names from the dataset: ${countryList}

Color palette to use:
- #b5451b (rust/red) for aggressive/dominant powers
- #4a6fa5 (steel blue) for democratic/allied powers
- #5a8a5a (muted green) for neutral/independent states
- #8a6a4a (earth brown) for colonial/occupied territories
- #c9973a (gold) for emerging/revolutionary powers
- #7a4a8a (purple) for ancient/fallen empires

Only include countries relevant to the scenario. Be historically informed but creative for alt-history.`;

  const res = await fetch(`${WORKER_URL}/api/ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: systemPrompt }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  const data = await res.json();
  const rawText = data.text || '';

  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in response');

  const parsed = JSON.parse(jsonMatch[0]);

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
