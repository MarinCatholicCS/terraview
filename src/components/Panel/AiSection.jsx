import { useState } from 'react';
import { queryGemini } from '../../services/gemini';

export default function AiSection({
  currentYear,
  worldGeoJSON,
  onAiResult,
  onLoadingChange,
  onModeChange,
}) {
  const [apiKey, setApiKey] = useState('');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [responseVisible, setResponseVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  function showResponse(text) {
    setResponse(text);
    setResponseVisible(true);
  }

  async function handleApply() {
    if (!apiKey.trim()) { showResponse('⚠ Please enter your Gemini API key above.'); return; }
    if (!prompt.trim()) { showResponse('⚠ Describe a scenario to visualize.'); return; }

    setLoading(true);
    onLoadingChange(true, 'Querying Gemini AI…');

    const countryList = worldGeoJSON
      ? worldGeoJSON.features.map(f => f.properties.ADMIN || f.properties.name).filter(Boolean).slice(0, 80).join(', ')
      : 'various countries';

    try {
      const result = await queryGemini({
        apiKey: apiKey.trim(),
        prompt: prompt.trim(),
        currentYear,
        countryList,
      });

      showResponse(result.narrative);
      onModeChange('alt-history');
      onAiResult(result.overrides, result.legend);
    } catch (e) {
      showResponse(`⚠ Gemini error: ${e.message}`);
    } finally {
      setLoading(false);
      onLoadingChange(false);
    }
  }

  return (
    <div className="ai-section">
      <div className="section-label">Gemini AI Layer</div>
      <input
        className="gemini-key-input"
        type="password"
        placeholder="Paste your Gemini API key…"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      />
      <textarea
        className="ai-prompt"
        placeholder={"Describe a scenario…\ne.g. 'What if Nazi Germany won WWII?'\ne.g. 'Show the Roman Empire at its peak'"}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        className={`apply-btn${loading ? ' loading' : ''}`}
        onClick={handleApply}
      >
        {loading ? '… Consulting Gemini' : '→ Apply to Map'}
      </button>
      <div className={`ai-response${responseVisible ? ' visible' : ''}`}>
        {response}
      </div>
    </div>
  );
}
