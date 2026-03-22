import { useCallback } from 'react';
import PanelHeader from './PanelHeader';
import YearControl from './YearControl';
import AiSection from './AiSection';

export default function Panel({
  currentYear,
  currentMode,
  worldGeoJSON,
  aiLegend,
  aiEvents,
  isLoading,
  panelWidth,
  onPanelResize,
  onYearChange,
  onModeChange,
  onAiResult,
  onLoadingChange,
  user,
  onLogOut,
  credits,
  onCreditUsed,
}) {
  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = panelWidth;

    function onMouseMove(e) {
      const newWidth = Math.min(600, Math.max(280, startWidth + (e.clientX - startX)));
      onPanelResize(newWidth);
    }

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [panelWidth, onPanelResize]);

  return (
    <div className="panel" style={{ width: panelWidth, minWidth: panelWidth }}>
      <PanelHeader />

      <div className="panel-body">
        {/* Account bar */}
        <div className="account-bar">
          <div className="account-info">
            {user.photoURL && (
              <img className="account-avatar" src={user.photoURL} alt="" referrerPolicy="no-referrer" />
            )}
            <span className="account-name">{user.displayName || user.email}</span>
          </div>
          <button className="reset-btn" onClick={onLogOut}>Sign Out</button>
        </div>

        <YearControl currentYear={currentYear} onYearChange={onYearChange} disabled={isLoading} />

        <AiSection
          currentYear={currentYear}
          currentMode={currentMode}
          worldGeoJSON={worldGeoJSON}
          onAiResult={onAiResult}
          onLoadingChange={onLoadingChange}
          onModeChange={onModeChange}
          onYearChange={onYearChange}
          aiEvents={aiEvents}
          user={user}
          credits={credits}
          onCreditUsed={onCreditUsed}
        />

      </div>

      <div className="panel-resize-handle" onMouseDown={handleResizeStart} />
    </div>
  );
}
