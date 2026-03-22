import { useState, useCallback } from 'react';
import PanelHeader from './PanelHeader';
import YearControl from './YearControl';
import AiSection from './AiSection';

import StatusBar from './StatusBar';

export default function Panel({
  currentYear,
  currentMode,
  worldGeoJSON,
  aiLegend,
  statusText,
  isLoading,
  panelWidth,
  onPanelResize,
  onYearChange,
  onModeChange,
  onAiResult,
  onLoadingChange,
  user,
  onLogOut,
  onDeleteAccount,
}) {
  const [showAccount, setShowAccount] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  async function handleDelete() {
    if (!window.confirm('Permanently delete your account? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await onDeleteAccount();
    } catch (err) {
      const msg = err.code === 'auth/requires-recent-login'
        ? 'Please sign out and sign back in, then try again.'
        : err.message;
      alert('Could not delete account: ' + msg);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="panel" style={{ width: panelWidth, minWidth: panelWidth }}>
      <PanelHeader />

      <div className="panel-body">
        {/* Account bar */}
        <div className="account-bar">
          <button
            className="account-toggle"
            onClick={() => setShowAccount((v) => !v)}
            title={user.email}
          >
            {user.email}
          </button>

          {showAccount && (
            <div className="account-menu">
              <button className="reset-btn" onClick={onLogOut}>Sign Out</button>
              <button
                className="reset-btn account-delete-btn"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete Account'}
              </button>
            </div>
          )}
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
          user={user}
        />

      </div>

      <StatusBar statusText={statusText} />
      <div className="panel-resize-handle" onMouseDown={handleResizeStart} />
    </div>
  );
}
