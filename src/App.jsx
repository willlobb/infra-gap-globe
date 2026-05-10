import { useState } from 'react';
import GlobeMap from './components/GlobeMap';
import LayerControls from './components/LayerControls';
import Legend from './components/Legend';
import InfoPanel from './components/InfoPanel';
import { useMapData } from './hooks/useMapData';

const DEFAULT_LAYERS = { gapScore: true, infrastructure: false };

export default function App() {
  const { data, loading } = useMapData();
  const [layers, setLayers] = useState(DEFAULT_LAYERS);
  const [selected, setSelected] = useState(null);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Infrastructure Gap Finder</h1>
        <p>Where cycling &amp; transit infrastructure is missing most — globally</p>
      </header>

      <div className="map-container">
        {loading ? (
          <div className="loading">Loading data…</div>
        ) : (
          <GlobeMap
            data={data}
            layers={layers}
            onSelect={setSelected}
          />
        )}
      </div>

      <div className="sidebar">
        <LayerControls layers={layers} onChange={setLayers} />
        <Legend />
        <InfoPanel feature={selected} />
      </div>
    </div>
  );
}
