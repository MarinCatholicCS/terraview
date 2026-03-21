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
}) {
  return (
    <div className="panel">
      <PanelHeader />

      <div className="panel-body">
        <YearControl currentYear={currentYear} onYearChange={onYearChange} />

        <AiSection
          currentYear={currentYear}
          currentMode={currentMode}
          worldGeoJSON={worldGeoJSON}
          onAiResult={onAiResult}
          onLoadingChange={onLoadingChange}
          onModeChange={onModeChange}
        />

        <Legend currentYear={currentYear} aiLegend={aiLegend} />

        <p className="info-note">
          Border data is approximated per era. AI layer modifies territory colors and descriptions.
          For precise GeoJSON data, connect the Chronas or geoBoundaries API.
        </p>
      </div>

      <StatusBar statusText={statusText} />
    </div>
  );
}
