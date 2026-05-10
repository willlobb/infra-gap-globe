import { useState, useEffect } from 'react';
import sampleData from '../data/sample.json';

export function useMapData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, replace with fetch to processed tile/geojson endpoint
    const points = sampleData.map(d => ({
      ...d,
      position: [d.lng, d.lat],
    }));
    setData(points);
    setLoading(false);
  }, []);

  return { data, loading };
}
