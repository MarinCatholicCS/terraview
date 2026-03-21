export default function ModeToggle({ currentMode, onModeChange }) {
  return (
    <div>
      <div className="section-label">Map Mode</div>
      <div className="mode-toggle">
        <button
          className={`mode-btn${currentMode === 'historical' ? ' active' : ''}`}
          onClick={() => onModeChange('historical')}
        >
          Historical
        </button>
        <button
          className={`mode-btn${currentMode === 'alt-history' ? ' active' : ''}`}
          onClick={() => onModeChange('alt-history')}
        >
          Alt-History
        </button>
      </div>
    </div>
  );
}
