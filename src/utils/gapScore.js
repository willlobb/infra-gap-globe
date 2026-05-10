export function computeGapScore({ population_density, income_index, infra_score }) {
  const maxDensity = 71263;
  const normalizedDensity = Math.min(population_density / maxDensity, 1);
  const need = normalizedDensity * (1 - income_index);
  const gap = need - infra_score * 0.5;
  return Math.max(0, Math.min(1, gap));
}

export function getGapColor(score) {
  if (score > 0.8) return [180, 0, 0];
  if (score > 0.6) return [230, 60, 0];
  if (score > 0.4) return [240, 140, 0];
  if (score > 0.2) return [200, 200, 0];
  return [60, 180, 60];
}

export function getGapLabel(score) {
  if (score > 0.8) return 'Critical';
  if (score > 0.6) return 'High';
  if (score > 0.4) return 'Moderate';
  if (score > 0.2) return 'Low';
  return 'Well Served';
}
