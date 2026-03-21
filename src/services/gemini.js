export async function queryGemini({ apiKey, prompt, currentYear, countryList }) {
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
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts || [];

  // Combine all non-thinking text parts
  const rawText = parts
    .filter(p => !p.thought)
    .map(p => p.text || '')
    .join('');

  if (!rawText.trim()) {
    // If filtering excluded everything, try ALL parts
    const allText = parts.map(p => p.text || '').join('');
    return parseGeminiJson(allText);
  }

  return parseGeminiJson(rawText);
}

function parseGeminiJson(text) {
  // Strip markdown code fences if present
  const cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  // Try direct parse
  try {
    const parsed = JSON.parse(cleaned);
    return formatResult(parsed);
  } catch {
    // ignored
  }

  // Fallback: find the outermost { ... } block
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
          const parsed = JSON.parse(cleaned.slice(start, i + 1));
          return formatResult(parsed);
        } catch {
          // keep searching
        }
      }
    }
  }

  throw new Error(
    `Could not parse Gemini response. Preview: ${text.slice(0, 500)}`
  );
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
