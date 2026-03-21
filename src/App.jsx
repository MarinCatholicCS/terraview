import { useState, useEffect, useCallback } from 'react';
import Panel from './components/Panel/Panel';
import MapView from './components/Map/MapView';

const GEOJSON_URL = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';

export default function App() {
  const [currentYear, setCurrentYear] = useState(1945);
  const [currentMode, setCurrentMode] = useState('historical');
  const [worldGeoJSON, setWorldGeoJSON] = useState(null);
  const [aiOverrides, setAiOverrides] = useState(null);
  const [aiLegend, setAiLegend] = useState(null);
  const [statusText, setStatusText] = useState('Ready — Year 1945');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Consulting the archives…');

  // Fetch world GeoJSON on mount
  useEffect(() => {
    setIsLoading(true);
    setLoadingText('Consulting the archives…');

    fetch(GEOJSON_URL)
      .then((res) => res.json())
      .then((data) => setWorldGeoJSON(data))
      .catch(() => setStatusText('Border data unavailable — check connection'))
      .finally(() => setIsLoading(false));
  }, []);

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

  return (
    <>
      <Panel
        currentYear={currentYear}
        currentMode={currentMode}
        worldGeoJSON={worldGeoJSON}
        aiLegend={aiLegend}
        statusText={statusText}
        onYearChange={handleYearChange}
        onModeChange={handleModeChange}
        onAiResult={handleAiResult}
        onLoadingChange={handleLoadingChange}
      />
      <MapView
        currentYear={currentYear}
        currentMode={currentMode}
        worldGeoJSON={worldGeoJSON}
        aiOverrides={aiOverrides}
        isLoading={isLoading}
        loadingText={loadingText}
      />
    </>
  );
}
