import { useState } from 'react';
import { queryGemini } from '../../services/gemini';

export default function AiSection({
  currentYear,
  currentMode,
  worldGeoJSON,
  onAiResult,
  onLoadingChange,
  onModeChange,
  user,
}) {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [responseVisible, setResponseVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  function showResponse(text) {
    setResponse(text);
    setResponseVisible(true);
  }

  async function handleApply() {
    if (!prompt.trim()) { showResponse('⚠ Describe a scenario to visualize.'); return; }

    setLoading(true);
    onLoadingChange(true, 'Querying Gemini AI…');

    const countryList = worldGeoJSON
      ? worldGeoJSON.features.map(f => f.properties.ADMIN || f.properties.name).filter(Boolean).join(', ')
      : 'various countries';

    try {
      const idToken = await user.getIdToken();
      const result = await queryGemini({
        idToken,
        prompt: prompt.trim(),
        currentYear,
        countryList,
      });

      showResponse(result.narrative);
      onModeChange('alt-history');
      onAiResult(result.overrides, result.legend);
    } catch (e) {
      showResponse(`Error: ${e.message}`);
    } finally {
      setLoading(false);
      onLoadingChange(false);
    }
  }

  function handleReset() {
    onModeChange('historical');
    setResponseVisible(false);
  }

  return (
    <div className="ai-section">
      <div className="section-label">Gemini AI Layer</div>

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
        {loading ? 'Consulting Gemini…' : 'Apply to Map'}
      </button>

      {currentMode === 'alt-history' && (
        <button className="reset-btn" onClick={handleReset}>
          ← Reset to Historical View
        </button>
      )}

      <div className={`ai-response${responseVisible ? ' visible' : ''}`}>
        {response}
      </div>
    </div>
  );
}
