import React from 'react';
import { Target } from 'lucide-react';

export default function MetricsPanel({ state }) {
  const ep = state?.episode || 0;
  const m = state?.metrics || {};
  const step = state?.step || 0;

  const last = (arr) => arr?.length ? arr[arr.length - 1] : 0;

  const accuracy = last(m.accuracy);
  const collisions = last(m.collisions);
  const nearMisses = last(m.near_misses);
  const precision = last(m.precision);
  const pathLen = last(m.path_length);
  const stops = last(m.stops);
  const reward = last(m.reward);
  const timeTaken = last(m.time_taken);

  const getPhaseLabel = () => {
    if (ep === 0) return { label: "Waiting to Start", desc: "Place obstacles and click Start." };
    if (ep <= 2) return { label: "🔴 Exploration Phase", desc: "Making mistakes, exploring the environment randomly." };
    if (ep <= 5) return { label: "🟡 Learning Phase", desc: "Fewer mistakes, developing basic avoidance reflexes." };
    if (ep <= 8) return { label: "🟢 Refinement Phase", desc: "Improved route selection, reduced collisions significantly." };
    return { label: "✅ Mastery Phase", desc: "Smooth navigation, zero collisions, reflexes fully developed." };
  };

  const phase = getPhaseLabel();

  return (
    <div className="metrics-panel glass-panel">
      <div className="panel-header">
        <Target size={16} />
        <h2>Metrics (Ep {ep})</h2>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Success</div>
          <div className="metric-value" style={{color: accuracy > 0 ? 'var(--success)' : 'var(--danger)'}}>{accuracy}%</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Collisions</div>
          <div className="metric-value" style={{color: collisions > 0 ? 'var(--danger)' : 'var(--success)'}}>{collisions}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Near Misses</div>
          <div className="metric-value" style={{color: nearMisses > 3 ? 'var(--warning)' : 'var(--accent-light)'}}>{nearMisses}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Precision</div>
          <div className="metric-value">{precision}%</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Path Length</div>
          <div className="metric-value">{pathLen}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Stops</div>
          <div className="metric-value">{stops}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Time (steps)</div>
          <div className="metric-value">{timeTaken}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Reward</div>
          <div className="metric-value" style={{color: reward >= 0 ? 'var(--success)' : 'var(--danger)'}}>{reward}</div>
        </div>
      </div>

      <div className="insight-box">
        <h3>🧠 {phase.label}</h3>
        <p>{phase.desc}</p>
      </div>
    </div>
  );
}
