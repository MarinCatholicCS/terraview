import { useState, useEffect, useRef } from 'react';
import { queryAI } from '../../services/gemini';

const LOADING_PHRASES = [
  'Rewriting the timeline\u2026',
  'Altering the course of nations\u2026',
  'Tracing the butterfly effect\u2026',
  'Redrawing borders\u2026',
  'Consulting alternate historians\u2026',
  'Unraveling causality chains\u2026',
  'Forging a new world order\u2026',
  'Calculating geopolitical ripples\u2026',
];

export default function AiSection({
  currentYear,
  currentMode,
  worldGeoJSON,
  onAiResult,
  onLoadingChange,
  onModeChange,
  onYearChange,
  user,
}) {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [responseVisible, setResponseVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const phraseIndex = useRef(0);

  // Rotate loading phrases while loading
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      phraseIndex.current = (phraseIndex.current + 1) % LOADING_PHRASES.length;
      onLoadingChange(true, LOADING_PHRASES[phraseIndex.current]);
    }, 2500);
    return () => clearInterval(interval);
  }, [loading, onLoadingChange]);

  function showResponse(text) {
    setResponse(text);
    setResponseVisible(true);
  }

  async function handleApply() {
    if (!prompt.trim()) { showResponse('⚠ Describe a scenario to visualize.'); return; }

    setLoading(true);
    phraseIndex.current = 0;
    onLoadingChange(true, LOADING_PHRASES[0]);
    onYearChange(2026, true);

    try {
      const idToken = await user.getIdToken();
      const result = await queryAI({
        idToken,
        prompt: prompt.trim(),
        currentYear: 2026,
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
      <div className="section-label">How will you change history?</div>

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
