import { ColumnLayer } from '@deck.gl/layers';

function gapColor(score) {
  if (score > 0.8) return [200, 0, 30, 230];
  if (score > 0.6) return [240, 80, 0, 230];
  if (score > 0.4) return [255, 165, 0, 230];
  if (score > 0.2) return [210, 210, 0, 230];
  return [40, 200, 80, 230];
}

export function buildGapScoreLayer(data, visible) {
  return new ColumnLayer({
    id: 'gap-score',
    data,
    visible,
    getPosition: d => d.position,
    getElevation: d => d.gap_score * 2500000,
    getFillColor: d => gapColor(d.gap_score),
    getLineColor: [255, 255, 255, 60],
    radius: 220000,
    extruded: true,
    pickable: true,
    lineWidthMinPixels: 1,
    material: {
      ambient: 0.4,
      diffuse: 0.6,
      shininess: 40,
      specularColor: [60, 60, 60],
    },
  });
}
