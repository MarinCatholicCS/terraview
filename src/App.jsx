import { useState, useEffect, useCallback } from 'react';
import Panel from './components/Panel/Panel';
import MapView from './components/Map/MapView';
import AuthScreen from './components/Auth/AuthScreen';
import { onAuthChange, logOut, deleteAccount } from './services/firebase';

const GEOJSON_URL = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = loading, null = signed out
  const [currentYear, setCurrentYear] = useState(1945);
  const [currentMode, setCurrentMode] = useState('historical');
  const [worldGeoJSON, setWorldGeoJSON] = useState(null);
  const [aiOverrides, setAiOverrides] = useState(null);
  const [aiLegend, setAiLegend] = useState(null);
  const [statusText, setStatusText] = useState('Ready — Year 1945');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Consulting the archives…');

  // Listen to auth state
  useEffect(() => onAuthChange(setUser), []);

  // Fetch world GeoJSON on mount
  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    setLoadingText('Consulting the archives…');

    fetch(GEOJSON_URL)
      .then((res) => res.json())
      .then((data) => setWorldGeoJSON(data))
      .catch(() => setStatusText('Border data unavailable — check connection'))
      .finally(() => setIsLoading(false));
  }, [user]);

  const handleYearChange = useCallback((year) => {
    setCurrentYear(year);
    setStatusText(`Viewing year ${year}`);
  }, []);

  const handleModeChange = useCallback((mode) => {
    setCurrentMode(mode);
    if (mode === 'historical') {
      setAiOverrides(null);
      setAiLegend(null);
    }
  }, []);

  const handleAiResult = useCallback((overrides, legend) => {
    setAiOverrides(overrides);
    setAiLegend(legend);
  }, []);

  const handleLoadingChange = useCallback((loading, text) => {
    setIsLoading(loading);
    if (text) setLoadingText(text);
  }, []);

  // Auth loading state
  if (user === undefined) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="logo">Terra<span>View</span></h1>
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
        statusText={statusText}
        onYearChange={handleYearChange}
        onModeChange={handleModeChange}
        onAiResult={handleAiResult}
        onLoadingChange={handleLoadingChange}
        user={user}
        onLogOut={logOut}
        onDeleteAccount={deleteAccount}
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
