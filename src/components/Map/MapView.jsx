import { useRef, useEffect } from 'react';
import L from 'leaflet';
import { getEraKey, ERA_DATA } from '../../data/eraData';
import { capitalize } from '../../utils/helpers';

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTR = '&copy; <a href="https://carto.com/">CARTO</a>';

export default function MapView({
  currentYear,
  currentMode,
  worldGeoJSON,
  aiOverrides,
  isLoading,
  loadingText,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const geoLayerRef = useRef(null);

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [20, 10],
      zoom: 2,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer(TILE_URL, {
      attribution: TILE_ATTR,
      subdomains: 'abcd',
      maxZoom: 10,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Re-render GeoJSON layer when data changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !worldGeoJSON) return;

    const eraKey = getEraKey(currentYear);
    const era = ERA_DATA[eraKey];

    // Build country → style lookup
    const styleMap = {};

    if (aiOverrides) {
      for (const [country, style] of Object.entries(aiOverrides)) {
        styleMap[country] = style;
      }
    }

    for (const [groupName, group] of Object.entries(era.groups)) {
      for (const country of group.countries) {
        if (!styleMap[country]) {
          styleMap[country] = { color: group.color, opacity: group.opacity, group: groupName };
        }
      }
    }

    // Remove old layer
    if (geoLayerRef.current) {
      map.removeLayer(geoLayerRef.current);
      geoLayerRef.current = null;
    }

    const geoLayer = L.geoJSON(worldGeoJSON, {
      style: (feature) => {
        const name = feature.properties.ADMIN || feature.properties.name || '';
        const s = styleMap[name];
        if (s) {
          return {
            fillColor: s.color,
            fillOpacity: s.opacity,
            color: 'rgba(245,237,224,0.12)',
            weight: 0.7,
            opacity: 1,
          };
        }
        return {
          fillColor: '#1e2f3d',
          fillOpacity: 0.3,
          color: 'rgba(245,237,224,0.06)',
          weight: 0.5,
          opacity: 1,
        };
      },
      onEachFeature: (feature, layer) => {
        const name = feature.properties.ADMIN || feature.properties.name || 'Unknown';
        const s = styleMap[name];
        const groupLabel = s ? capitalize(s.group || '') : 'Independent';
        layer.bindTooltip(
          `<strong>${name}</strong><br/><span style="opacity:0.6;font-size:10px">${groupLabel} · ${currentYear}</span>`,
          { className: 'country-tooltip', sticky: true, direction: 'top', offset: [0, -4] }
        );
        layer.on('mouseover', function () {
          this.setStyle({ weight: 1.5, color: 'rgba(201,151,58,0.5)' });
        });
        layer.on('mouseout', function () {
          geoLayer.resetStyle(this);
        });
      },
    }).addTo(map);

    geoLayerRef.current = geoLayer;
  }, [worldGeoJSON, currentYear, aiOverrides]);

  return (
    <div className="map-wrapper">
      <div className="map-container" ref={mapContainerRef} />

      <div className="map-topbar">
<div className="mode-badge">
          {currentMode === 'alt-history' ? 'Alt-History Mode' : 'Historical Mode'}
        </div>
      </div>

      <div className="map-year-overlay">{currentYear}</div>

      <div className={`loading-overlay${isLoading ? ' visible' : ''}`}>
        <div className="spinner" />
        <div className="loading-text">{loadingText}</div>
      </div>
    </div>
  );
}
