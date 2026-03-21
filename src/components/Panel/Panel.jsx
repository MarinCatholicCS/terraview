import { useState } from 'react';
import PanelHeader from './PanelHeader';
import YearControl from './YearControl';
import AiSection from './AiSection';
import Legend from './Legend';
import StatusBar from './StatusBar';

export default function Panel({
  currentYear,
  currentMode,
  worldGeoJSON,
  aiLegend,
  statusText,
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
    <div className="panel">
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

        <YearControl currentYear={currentYear} onYearChange={onYearChange} />

        <AiSection
          currentYear={currentYear}
          currentMode={currentMode}
          worldGeoJSON={worldGeoJSON}
          onAiResult={onAiResult}
          onLoadingChange={onLoadingChange}
          onModeChange={onModeChange}
          user={user}
        />

        <Legend currentYear={currentYear} aiLegend={aiLegend} />

      </div>

      <StatusBar statusText={statusText} />
    </div>
  );
}
