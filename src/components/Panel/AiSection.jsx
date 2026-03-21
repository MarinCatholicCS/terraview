import { useState } from 'react';
import { queryGemini } from '../../services/gemini';

const STORAGE_KEY = 'gemini_api_key';

export default function AiSection({
  currentYear,
  currentMode,
  worldGeoJSON,
  onAiResult,
  onLoadingChange,
  onModeChange,
}) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const [showKey, setShowKey] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [responseVisible, setResponseVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleApiKeyChange(e) {
    const val = e.target.value;
    setApiKey(val);
    if (val.trim()) {
      localStorage.setItem(STORAGE_KEY, val);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  function showResponse(text) {
    setResponse(text);
    setResponseVisible(true);
  }

  async function handleApply() {
    if (!apiKey.trim()) { showResponse('Please enter your Gemini API key above.'); return; }
    if (!prompt.trim()) { showResponse('Describe a scenario to visualize.'); return; }

    setLoading(true);
    onLoadingChange(true, 'Querying Gemini AI…');

    const countryList = worldGeoJSON
      ? worldGeoJSON.features.map(f => f.properties.ADMIN || f.properties.name).filter(Boolean).slice(0, 50).join(', ')
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

      <div className="key-input-row">
        <input
          className="gemini-key-input"
          type={showKey ? 'text' : 'password'}
          placeholder="Paste your Gemini API key…"
          value={apiKey}
          onChange={handleApiKeyChange}
        />
        <button
          className="key-toggle-btn"
          onClick={() => setShowKey(v => !v)}
          title={showKey ? 'Hide key' : 'Show key'}
        >
          {showKey ? '◉' : '⊙'}
        </button>
      </div>

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
