import { useState } from 'react';
import { getEraKey, ERA_DATA } from '../../data/eraData';
import { capitalize } from '../../utils/helpers';

export default function Legend({ currentYear, aiLegend }) {
  const [collapsed, setCollapsed] = useState(false);
  const eraKey = getEraKey(currentYear);
  const era = ERA_DATA[eraKey];

  const items = aiLegend
    ? aiLegend.map((item, i) => (
        <div className="legend-item" key={i}>
          <div className="legend-swatch" style={{ background: item.color }} />
          <span>{item.label}</span>
        </div>
      ))
    : Object.entries(era.groups).map(([key, group]) => (
        <div className="legend-item" key={key}>
          <div className="legend-swatch" style={{ background: group.color }} />
          <span>{capitalize(key)}</span>
        </div>
      ));

  return (
    <div className="legend">
      <button className="legend-toggle" onClick={() => setCollapsed((v) => !v)}>
        <span className={`legend-arrow${collapsed ? ' collapsed' : ''}`}>&#9662;</span>
        Active Powers
      </button>
      {!collapsed && items}
    </div>
  );
}
