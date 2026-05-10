import { ScatterplotLayer } from '@deck.gl/layers';

export function buildInfrastructureLayer(data, visible) {
  return new ScatterplotLayer({
    id: 'infrastructure',
    data: data.filter(d => d.infra_score > 0.05),
    visible,
    getPosition: d => d.position,
    getRadius: d => d.infra_score * 180000,
    radiusMinPixels: 4,
    radiusMaxPixels: 28,
    getFillColor: d => [50, 180, 255, Math.round(140 + d.infra_score * 115)],
    getLineColor: [200, 240, 255, 80],
    lineWidthMinPixels: 1,
    stroked: true,
    pickable: true,
  });
}
