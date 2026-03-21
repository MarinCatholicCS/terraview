import { useState } from 'react';
import { queryAI } from '../../services/gemini';

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
    onLoadingChange(true, 'Simulating alternate timeline…');

    const countryList = worldGeoJSON
      ? worldGeoJSON.features.map(f => f.properties.ADMIN || f.properties.name).filter(Boolean).join(', ')
      : 'various countries';

    try {
      const idToken = await user.getIdToken();
      const result = await queryAI({
        idToken,
        prompt: prompt.trim(),
        currentYear: 2026,
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
      <div className="section-label">What If? Simulator</div>

      <textarea
        className="ai-prompt"
        placeholder={"What if…?\ne.g. 'What if Hitler won WW2?'\ne.g. 'What if the Roman Empire never fell?'"}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <button
        className={`apply-btn${loading ? ' loading' : ''}`}
        onClick={handleApply}
      >
        {loading ? 'Simulating…' : 'Simulate'}
      </button>

      {currentMode === 'alt-history' && (
        <button className="reset-btn" onClick={handleReset}>
          ← Reset to Present Day
        </button>
      )}

      <div className={`ai-response${responseVisible ? ' visible' : ''}`}>
        {response}
      </div>
    </div>
  );
}
