import { useState, useEffect, useCallback } from 'react';
import Panel from './components/Panel/Panel';
import MapView from './components/Map/MapView';
import AuthScreen from './components/Auth/AuthScreen';
import { onAuthChange, logOut, initUserCredits } from './services/firebase';

const GEOJSON_URL = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = loading, null = signed out
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMode, setCurrentMode] = useState('historical');
  const [worldGeoJSON, setWorldGeoJSON] = useState(null);
  const [aiOverrides, setAiOverrides] = useState(null);
  const [aiLegend, setAiLegend] = useState(null);
  const [aiEvents, setAiEvents] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Consulting the archives…');
  const [panelWidth, setPanelWidth] = useState(340);
  const [credits, setCredits] = useState(null);

  // Listen to auth state
  useEffect(() => onAuthChange(setUser), []);

  // Init credits on sign-in
  useEffect(() => {
    if (!user) { setCredits(null); return; }
    initUserCredits(user.uid, user.email).then(setCredits).catch(() => {});
  }, [user]);

  // Fetch world GeoJSON on mount
  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    setLoadingText('Consulting the archives…');

    fetch(GEOJSON_URL)
      .then((res) => res.json())
      .then((data) => setWorldGeoJSON(data))
      .catch(() => console.error('Border data unavailable — check connection'))
      .finally(() => setIsLoading(false));
  }, [user]);

  const handleYearChange = useCallback((year, fromAi) => {
    setCurrentYear(year);
    if (!fromAi && currentMode === 'alt-history') {
      setCurrentMode('historical');
      setAiOverrides(null);
      setAiLegend(null);
      setAiEvents(null);
    }
  }, [currentMode]);

  const handleModeChange = useCallback((mode) => {
    setCurrentMode(mode);
    if (mode === 'historical') {
      setAiOverrides(null);
      setAiLegend(null);
      setAiEvents(null);
    }
  }, []);

  const handleAiResult = useCallback((overrides, legend, events) => {
    setAiOverrides(overrides);
    setAiLegend(legend);
    setAiEvents(events);
  }, []);

  const handleLoadingChange = useCallback((loading, text) => {
    setIsLoading(loading);
    if (text) setLoadingText(text);
  }, []);

  const handleCreditUsed = useCallback((creditsRemaining) => {
    if (creditsRemaining !== undefined && creditsRemaining !== null) {
      setCredits(creditsRemaining);
    } else {
      setCredits((prev) => (prev !== null ? Math.max(0, prev - 1) : prev));
    }
  }, []);

  // Auth loading state
  if (user === undefined) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="logo"><img src="/terraview.png" alt="" className="logo-icon" />Terra<span>View</span></h1>
            <p className="tagline">Loading…</p>
          </div>
        </div>
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return <AuthScreen />;
  }

  return (
    <>
      <Panel
        currentYear={currentYear}
        currentMode={currentMode}
        worldGeoJSON={worldGeoJSON}
        aiLegend={aiLegend}
        isLoading={isLoading}
        panelWidth={panelWidth}
        onPanelResize={setPanelWidth}
        onYearChange={handleYearChange}
        onModeChange={handleModeChange}
        aiEvents={aiEvents}
        onAiResult={handleAiResult}
        onLoadingChange={handleLoadingChange}
        user={user}
        onLogOut={logOut}
        credits={credits}
        onCreditUsed={handleCreditUsed}
      />
      <MapView
        currentYear={currentYear}
        currentMode={currentMode}
        worldGeoJSON={worldGeoJSON}
        aiOverrides={aiOverrides}
        aiLegend={aiLegend}
        isLoading={isLoading}
        loadingText={loadingText}
      />
    </>
  );
}
