import { getGapLabel } from '../utils/gapScore';

export default function InfoPanel({ feature }) {
  if (!feature) {
    return (
      <div className="info-panel info-empty">
        <p>Click a column or dot to see details</p>
      </div>
    );
  }

  // Mapbox serialises GeoJSON properties as strings — parse back to numbers
  const gap = parseFloat(feature.gap_score);
  const pop = parseInt(feature.population_density);
  const income = parseFloat(feature.income_index);
  const infra = parseFloat(feature.infra_score);

  return (
    <div className="info-panel">
      <h3>{feature.city}</h3>
      <p className="country">{feature.country}</p>
      <div className="stat-grid">
        <div className="stat">
          <span className="stat-label">Gap Score</span>
          <span className="stat-value gap-value">{(gap * 100).toFixed(0)}%</span>
          <span className="stat-badge">{getGapLabel(gap)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Pop. Density</span>
          <span className="stat-value">{pop.toLocaleString()}</span>
          <span className="stat-badge">per km²</span>
        </div>
        <div className="stat">
          <span className="stat-label">Income Index</span>
          <span className="stat-value">{(income * 100).toFixed(0)}%</span>
          <span className="stat-badge">of global max</span>
        </div>
        <div className="stat">
          <span className="stat-label">Infra Score</span>
          <span className="stat-value">{(infra * 100).toFixed(0)}%</span>
          <span className="stat-badge">coverage</span>
        </div>
      </div>
    </div>
  );
}
