import { getEraKey, ERA_DATA } from '../../data/eraData';
import { capitalize } from '../../utils/helpers';

export default function Legend({ currentYear, aiLegend }) {
  const eraKey = getEraKey(currentYear);
  const era = ERA_DATA[eraKey];

  if (aiLegend) {
    return (
      <div className="legend">
        <div className="section-label">Active Powers</div>
        {aiLegend.map((item, i) => (
          <div className="legend-item" key={i}>
            <div className="legend-swatch" style={{ background: item.color }} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="legend">
      <div className="section-label">Active Powers</div>
      {Object.entries(era.groups).map(([key, group]) => (
        <div className="legend-item" key={key}>
          <div className="legend-swatch" style={{ background: group.color }} />
          <span>{capitalize(key)}</span>
        </div>
      ))}
    </div>
  );
}
