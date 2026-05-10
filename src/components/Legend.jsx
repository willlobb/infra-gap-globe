const STOPS = [
  { label: 'Critical (>80%)', color: 'rgb(100,0,0)' },
  { label: 'High (60–80%)', color: 'rgb(230,60,0)' },
  { label: 'Moderate (40–60%)', color: 'rgb(240,140,0)' },
  { label: 'Low (20–40%)', color: 'rgb(200,200,0)' },
  { label: 'Well Served (<20%)', color: 'rgb(60,180,60)' },
];

export default function Legend() {
  return (
    <div className="legend-panel">
      <h3>Gap Score</h3>
      {STOPS.map(({ label, color }) => (
        <div key={label} className="legend-row">
          <span className="legend-swatch" style={{ background: color }} />
          <span>{label}</span>
        </div>
      ))}
      <p className="legend-note">
        Gap = Population need − existing cycling/transit infrastructure density
      </p>
    </div>
  );
}
