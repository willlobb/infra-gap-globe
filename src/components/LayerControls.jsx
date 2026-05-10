export default function LayerControls({ layers, onChange }) {
  return (
    <div className="controls-panel">
      <h3>Layers</h3>
      <label className="toggle">
        <input
          type="checkbox"
          checked={layers.gapScore}
          onChange={e => onChange({ ...layers, gapScore: e.target.checked })}
        />
        <span className="toggle-dot gap" />
        Infrastructure Gap Score
      </label>
      <label className="toggle">
        <input
          type="checkbox"
          checked={layers.infrastructure}
          onChange={e => onChange({ ...layers, infrastructure: e.target.checked })}
        />
        <span className="toggle-dot infra" />
        Existing Infrastructure
      </label>
    </div>
  );
}
