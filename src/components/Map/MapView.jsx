import { useRef, useEffect } from 'react';
import L from 'leaflet';
import { getEraKey, ERA_DATA } from '../../data/eraData';
import { capitalize } from '../../utils/helpers';
import Legend from '../Panel/Legend';

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png';
const TILE_ATTR = '&copy; <a href="https://carto.com/">CARTO</a>';

export default function MapView({
  currentYear,
  currentMode,
  worldGeoJSON,
  aiOverrides,
  aiLegend,
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
      center: [30, 10],
      zoom: 3,
      minZoom: 3,
      zoomControl: false,
      attributionControl: false,
      maxBounds: [[-60, -180], [85, 180]],
      maxBoundsViscosity: 1.0,
    });

    L.tileLayer(TILE_URL, {
      attribution: TILE_ATTR,
      subdomains: 'abcd',
      maxZoom: 10,
      noWrap: true,
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

    const effectiveYear = (currentMode === 'alt-history' && aiOverrides) ? 2026 : currentYear;
    const eraKey = getEraKey(effectiveYear);
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

    function getStyle(name) {
      const s = styleMap[name];
      if (s) {
        return {
          fillColor: s.color,
          fillOpacity: s.opacity,
          color: s.color,
          weight: 1.5,
          opacity: 0.3,
        };
      }
      return {
        fillColor: '#1e2f3d',
        fillOpacity: 0.3,
        color: '#1e2f3d',
        weight: 1.5,
        opacity: 0.3,
      };
    }

    // If the layer already exists, animate style updates instead of rebuilding
    if (geoLayerRef.current) {
      geoLayerRef.current.eachLayer((layer) => {
        const name = layer.feature.properties.ADMIN || layer.feature.properties.name || '';
        if (name === 'Antarctica') return;
        const newStyle = getStyle(name);
        layer._baseStyle = newStyle;
        layer.setStyle(newStyle);
        // Set fill via style property so CSS transitions animate
        const el = layer.getElement?.();
        if (el) {
          el.style.fill = newStyle.fillColor;
          el.style.fillOpacity = newStyle.fillOpacity;
        }
        // Update tooltip
        const displayName = name || 'Unknown';
        const s = styleMap[displayName];
        const groupLabel = s ? capitalize(s.group || '') : 'Independent';
        layer.unbindTooltip();
        layer.bindTooltip(
          `<strong>${displayName}</strong><br/><span style="opacity:0.6;font-size:10px">${groupLabel} · ${effectiveYear}</span>`,
          { className: 'country-tooltip', sticky: true, direction: 'top', offset: [0, -4] }
        );
      });
      return;
    }

    const filtered = {
      ...worldGeoJSON,
      features: worldGeoJSON.features.filter((f) => {
        const name = f.properties.ADMIN || f.properties.name || '';
        return name !== 'Antarctica';
      }),
    };

    const geoLayer = L.geoJSON(filtered, {
      style: (feature) => {
        const name = feature.properties.ADMIN || feature.properties.name || '';
        return getStyle(name);
      },
      onEachFeature: (feature, layer) => {
        const name = feature.properties.ADMIN || feature.properties.name || 'Unknown';
        const baseStyle = getStyle(name);
        layer._baseStyle = baseStyle;
        // Set fill via style property so CSS transitions have a starting value
        layer.on('add', function () {
          const el = this.getElement?.();
          if (el) {
            el.style.fill = baseStyle.fillColor;
            el.style.fillOpacity = baseStyle.fillOpacity;
          }
        });
        const s = styleMap[name];
        const groupLabel = s ? capitalize(s.group || '') : 'Independent';
        layer.bindTooltip(
          `<strong>${name}</strong><br/><span style="opacity:0.6;font-size:10px">${groupLabel} · ${effectiveYear}</span>`,
          { className: 'country-tooltip', sticky: true, direction: 'top', offset: [0, -4] }
        );
        layer.on('mouseover', function () {
          this.setStyle({ weight: 1.5, color: 'rgba(201,151,58,0.5)' });
        });
        layer.on('mouseout', function () {
          this.setStyle(this._baseStyle);
          const el = this.getElement?.();
          if (el) {
            el.style.fill = this._baseStyle.fillColor;
            el.style.fillOpacity = this._baseStyle.fillOpacity;
          }
        });
      },
    }).addTo(map);

    geoLayerRef.current = geoLayer;
  }, [worldGeoJSON, currentYear, currentMode, aiOverrides]);

  return (
    <div className="map-wrapper">
      <div className="map-container" ref={mapContainerRef} />

      <div className="map-legend">
        <Legend currentYear={currentYear} aiLegend={aiLegend} />
      </div>

      <div className={`loading-overlay${isLoading ? ' visible' : ''}`}>
        <div className="spinner" />
        <div className="loading-text">{loadingText}</div>
      </div>
    </div>
  );
}
