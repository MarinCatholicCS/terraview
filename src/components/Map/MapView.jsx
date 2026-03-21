import { useRef, useEffect, useState, useMemo } from 'react';
import L from 'leaflet';
import { getFlagForYear, ALL_FLAG_IDS, FLAG_PRIMARY_COLORS, EXTERNAL_FLAG_URLS } from '../../data/flagData';

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png';
const TILE_ATTR = '&copy; <a href="https://carto.com/">CARTO</a>';

// ─── GeoJSON preprocessing ────────────────────────────────────────────────────

// Signed area of a coordinate ring (lng/lat pairs) via shoelace formula.
// Used only for relative size comparison — geographic projection not needed.
function ringArea(ring) {
  let area = 0;
  const n = ring.length;
  for (let i = 0; i < n; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % n];
    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(area / 2);
}

// Bounding box of an outer ring as cardinal points.
function boundsOf(ring) {
  let west = Infinity, east = -Infinity, north = -Infinity, south = Infinity;
  for (const [lng, lat] of ring) {
    if (lng < west) west = lng;
    if (lng > east) east = lng;
    if (lat > north) north = lat;
    if (lat < south) south = lat;
  }
  return { west, east, north, south };
}

// Split every MultiPolygon country into individual Polygon features.
// The largest polygon (by outer-ring area) is marked isMain: true and gets
// its bounding box stored; all smaller polygons are marked isMain: false.
// Plain Polygon features pass through unchanged (isMain: true).
function preprocessGeoJSON(geoJSON) {
  const features = [];
  for (const feature of geoJSON.features) {
    const { geometry, properties } = feature;
    if (geometry.type === 'Polygon') {
      features.push({
        ...feature,
        properties: { ...properties, isMain: true, bounds: boundsOf(geometry.coordinates[0]) },
      });
    } else if (geometry.type === 'MultiPolygon') {
      let maxArea = -1;
      let maxIndex = 0;
      geometry.coordinates.forEach((polygon, i) => {
        const area = ringArea(polygon[0]);
        if (area > maxArea) { maxArea = area; maxIndex = i; }
      });
      geometry.coordinates.forEach((polygon, i) => {
        const isMain = i === maxIndex;
        features.push({
          type: 'Feature',
          properties: {
            ...properties,
            isMain,
            ...(isMain ? { bounds: boundsOf(polygon[0]) } : {}),
          },
          geometry: { type: 'Polygon', coordinates: polygon },
        });
      });
    } else {
      features.push(feature);
    }
  }
  return { ...geoJSON, features };
}

// ─────────────────────────────────────────────────────────────────────────────

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
  const patternSvgRef = useRef(null);
  const blobUrlsRef = useRef([]);       // tracks blob URLs so we can revoke on unmount
  const [flagsReady, setFlagsReady] = useState(false);

  // Pre-split MultiPolygons once per GeoJSON load (never changes after mount)
  const processedGeoJSON = useMemo(
    () => worldGeoJSON ? preprocessGeoJSON(worldGeoJSON) : null,
    [worldGeoJSON]
  );

  // Initialize map and fetch all flag SVG patterns
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [20, 10],
      zoom: 2,
      zoomControl: false,
      attributionControl: false,
      renderer: L.svg({ padding: 0.5 }),
    });

    L.tileLayer(TILE_URL, {
      attribution: TILE_ATTR,
      subdomains: 'abcd',
      maxZoom: 10,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapRef.current = map;

    // Create hidden SVG element to hold <pattern> definitions
    const svgNS = 'http://www.w3.org/2000/svg';
    const patternSvg = document.createElementNS(svgNS, 'svg');
    patternSvg.setAttribute('aria-hidden', 'true');
    Object.assign(patternSvg.style, {
      position: 'absolute',
      width: '0',
      height: '0',
      overflow: 'hidden',
      pointerEvents: 'none',
    });
    const defs = document.createElementNS(svgNS, 'defs');
    patternSvg.appendChild(defs);
    mapContainerRef.current.appendChild(patternSvg);
    patternSvgRef.current = patternSvg;

    // Load all flag patterns in parallel.
    // Complex flags (text, symbols, embedded sub-flags) are fetched from an
    // external CDN/Wikimedia and injected as an <image> blob URL.
    // Simple flags are fetched from local public/flags/ and inlined as SVG nodes.
    let cancelled = false;
    const base = import.meta.env.BASE_URL;
    const parser = new DOMParser();

    function makePattern(id) {
      const p = document.createElementNS(svgNS, 'pattern');
      p.setAttribute('id', id);
      p.setAttribute('patternUnits', 'objectBoundingBox');
      p.setAttribute('width', '1');
      p.setAttribute('height', '1');
      p.setAttribute('viewBox', '0 0 300 200');
      p.setAttribute('preserveAspectRatio', 'xMidYMid slice');
      return p;
    }

    async function loadOne(id) {
      const externalUrl = EXTERNAL_FLAG_URLS[id];

      // ── External image (complex flag) ────────────────────────────────────
      if (externalUrl) {
        try {
          const res = await fetch(externalUrl);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const blob = await res.blob();
          const blobUrl = URL.createObjectURL(blob);
          blobUrlsRef.current.push(blobUrl);

          const pattern = makePattern(id);
          const img = document.createElementNS(svgNS, 'image');
          img.setAttribute('href', blobUrl);
          img.setAttribute('x', '0');
          img.setAttribute('y', '0');
          img.setAttribute('width', '300');
          img.setAttribute('height', '200');
          img.setAttribute('preserveAspectRatio', 'xMidYMid slice');
          pattern.appendChild(img);
          defs.appendChild(pattern);
          return;
        } catch {
          // fall through to local SVG fallback
        }
      }

      // ── Local SVG (simple flag or fallback) ───────────────────────────────
      try {
        const res = await fetch(`${base}flags/${id}.svg`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        const doc = parser.parseFromString(text, 'image/svg+xml');
        const root = doc.documentElement;
        if (root.nodeName === 'parsererror') return;

        const pattern = makePattern(id);
        Array.from(root.childNodes).forEach(node =>
          pattern.appendChild(document.importNode(node, true))
        );
        defs.appendChild(pattern);
      } catch { /* skip flag — country will show fallback color */ }
    }

    Promise.all(ALL_FLAG_IDS.map(loadOne)).then(() => {
      if (!cancelled) setFlagsReady(true);
    });

    return () => {
      cancelled = true;
      blobUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
      blobUrlsRef.current = [];
      map.remove();
      mapRef.current = null;
      patternSvg.remove();
      patternSvgRef.current = null;
    };
  }, []);

  // Re-render GeoJSON layer when year / AI overrides / flags change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !processedGeoJSON || !flagsReady) return;

    if (geoLayerRef.current) {
      map.removeLayer(geoLayerRef.current);
      geoLayerRef.current = null;
    }

    const geoLayer = L.geoJSON(processedGeoJSON, {
      smoothFactor: 1.5,
      style: (feature) => {
        const name = feature.properties.name || feature.properties.ADMIN || '';
        const isMain = feature.properties.isMain !== false;

        // AI alt-history overrides always use a flat color (all polygons equally)
        if (aiOverrides && aiOverrides[name]) {
          const s = aiOverrides[name];
          return {
            fillColor: s.color,
            fillOpacity: s.opacity ?? 0.65,
            color: 'rgba(0,0,0,0.35)',
            weight: 0.8,
            opacity: 1,
          };
        }

        const flag = getFlagForYear(name, currentYear);
        if (!flag) {
          return {
            fillColor: '#1e2a3a',
            fillOpacity: 1,
            color: 'rgba(0,0,0,0.4)',
            weight: 0.8,
            opacity: 1,
          };
        }

        if (isMain) {
          // Main landmass: render the full flag pattern
          return {
            fillColor: `url(#${flag.patternId})`,
            fillOpacity: 1,
            color: 'rgba(0,0,0,0.4)',
            weight: 0.8,
            opacity: 1,
          };
        }

        // Smaller landmasses (islands, exclaves, Alaska, etc.): solid primary color
        return {
          fillColor: FLAG_PRIMARY_COLORS[flag.patternId] || '#1e2a3a',
          fillOpacity: 0.8,
          color: 'rgba(0,0,0,0.4)',
          weight: 0.8,
          opacity: 1,
        };
      },
      onEachFeature: (feature, layer) => {
        const name = feature.properties.name || feature.properties.ADMIN || 'Unknown territory';
        const flag = getFlagForYear(name, currentYear);
        const flagLabel = flag ? flag.name : 'Historical period undocumented';

        layer.bindTooltip(
          `<strong>${name}</strong><br/><span style="opacity:0.7;font-size:10px">${flagLabel} · ${currentYear}</span>`,
          { className: 'country-tooltip', sticky: true, direction: 'top', offset: [0, -4] }
        );

        layer.on('mouseover', function () {
          this.setStyle({ weight: 2.5, color: 'rgba(200,168,75,0.9)' });
        });
        layer.on('mouseout', function () {
          geoLayer.resetStyle(this);
        });
      },
    }).addTo(map);

    geoLayerRef.current = geoLayer;
  }, [processedGeoJSON, currentYear, aiOverrides, flagsReady]);

  return (
    <div className="map-wrapper">
      <div className="map-container" ref={mapContainerRef} />

      <div className="map-topbar">
        <div className="active-year-badge">Year {currentYear}</div>
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
