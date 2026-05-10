import { useState, useCallback, useMemo } from 'react';
import Map, { Source, Layer } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

const toRad = d => (d * Math.PI) / 180;

function circlePolygon([lng, lat], radiusKm, steps = 24) {
  const coords = [];
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * 2 * Math.PI;
    const dLng = (radiusKm * Math.cos(angle)) / (111.32 * Math.cos(toRad(lat)));
    const dLat = (radiusKm * Math.sin(angle)) / 110.574;
    coords.push([lng + dLng, lat + dLat]);
  }
  return { type: 'Polygon', coordinates: [coords] };
}

const GAP_COLOR = [
  'interpolate', ['linear'], ['get', 'gap_score'],
  0,   '#28c864',
  0.2, '#c8c800',
  0.4, '#ff8c00',
  0.6, '#e02800',
  0.85,'#8c0000',
  1,   '#500000',
];

const INITIAL_VIEW = { longitude: 20, latitude: 20, zoom: 1.6, pitch: 45, bearing: 0 };

const FOG = {
  color: 'rgb(186, 210, 235)',
  'high-color': 'rgb(36, 92, 223)',
  'horizon-blend': 0.02,
  'space-color': 'rgb(4, 7, 30)',
  'star-intensity': 0.6,
};

export default function GlobeMap({ data, layers, onSelect }) {
  const [cursor, setCursor] = useState('grab');

  const gapGeojson = useMemo(() => ({
    type: 'FeatureCollection',
    features: data.map(d => ({
      type: 'Feature',
      geometry: circlePolygon([d.lng, d.lat], 170),
      properties: {
        city: d.city,
        country: d.country,
        gap_score: d.gap_score,
        population_density: d.population_density,
        income_index: d.income_index,
        infra_score: d.infra_score,
      },
    })),
  }), [data]);

  const infraGeojson = useMemo(() => ({
    type: 'FeatureCollection',
    features: data.filter(d => d.infra_score > 0.05).map(d => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [d.lng, d.lat] },
      properties: {
        city: d.city,
        country: d.country,
        gap_score: d.gap_score,
        population_density: d.population_density,
        income_index: d.income_index,
        infra_score: d.infra_score,
      },
    })),
  }), [data]);

  const handleClick = useCallback(e => {
    const f = e.features?.[0];
    onSelect(f ? f.properties : null);
  }, [onSelect]);

  return (
    <Map
      initialViewState={INITIAL_VIEW}
      mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      projection="globe"
      fog={FOG}
      interactiveLayerIds={['gap-columns', 'infra-dots']}
      onClick={handleClick}
      onMouseEnter={() => setCursor('pointer')}
      onMouseLeave={() => setCursor('grab')}
      cursor={cursor}
      style={{ width: '100%', height: '100%' }}
    >
      <Source id="gap" type="geojson" data={gapGeojson}>
        {layers.gapScore && (
          <Layer
            id="gap-columns"
            type="fill-extrusion"
            paint={{
              'fill-extrusion-color': GAP_COLOR,
              'fill-extrusion-height': ['*', ['get', 'gap_score'], 1500000],
              'fill-extrusion-base': 0,
              'fill-extrusion-opacity': 0.9,
              'fill-extrusion-ambient-occlusion-intensity': 0.3,
            }}
          />
        )}
      </Source>

      <Source id="infra" type="geojson" data={infraGeojson}>
        {layers.infrastructure && (
          <Layer
            id="infra-dots"
            type="circle"
            paint={{
              'circle-radius': [
                'interpolate', ['linear'], ['zoom'],
                1, ['interpolate', ['linear'], ['get', 'infra_score'], 0, 3, 1, 8],
                4, ['interpolate', ['linear'], ['get', 'infra_score'], 0, 6, 1, 20],
              ],
              'circle-color': '#32b4ff',
              'circle-opacity': 0.85,
              'circle-stroke-color': 'rgba(255,255,255,0.4)',
              'circle-stroke-width': 1,
              'circle-pitch-alignment': 'map',
            }}
          />
        )}
      </Source>
    </Map>
  );
}
