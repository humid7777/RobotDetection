import React from 'react';
import { Award } from 'lucide-react';

export default function PresentationPanel({ summaries }) {
  if (!summaries) return null;

  const ep1 = summaries["1"];
  const ep10 = summaries["10"];

  if (!ep1) return null;

  const rows = [
    { label: "Reached Target", key: "reached", fmt: (v) => v ? "✅ Yes" : "❌ No" },
    { label: "Collisions", key: "collisions" },
    { label: "Near Misses", key: "near_misses" },
    { label: "Stops", key: "stops" },
    { label: "Steps Taken", key: "steps" },
    { label: "Path Length", key: "path_length" },
    { label: "Precision", key: "precision", fmt: (v) => `${v}%` },
    { label: "Reward", key: "reward" },
  ];

  return (
    <div className="presentation-panel glass-panel">
      <div className="panel-header">
        <Award size={16} />
        <h2>Learning Comparison</h2>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
        <span className="tag-before">Episode 1 — Before</span>
        {ep10 && <span className="tag-after">Episode 10 — After</span>}
      </div>

      <table className="comparison-table">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Ep 1</th>
            {ep10 && <th>Ep 10</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.key}>
              <td style={{ textAlign: 'left', color: 'var(--text-secondary)' }}>{r.label}</td>
              <td style={{ color: 'var(--danger)' }}>
                {r.fmt ? r.fmt(ep1[r.key]) : ep1[r.key]}
              </td>
              {ep10 && (
                <td style={{ color: 'var(--success)' }}>
                  {r.fmt ? r.fmt(ep10[r.key]) : ep10[r.key]}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="explanation-box">
        <p>
          <strong>🧠 Neuromorphic Learning:</strong> The robot develops reflex-like
          navigation by reinforcing successful decisions and suppressing behaviors
          that lead to collisions — similar to how humans improve through repeated
          experience. Early episodes show hesitation and mistakes; later episodes
          demonstrate smooth, confident, collision-free navigation.
        </p>
      </div>

      {ep10 && ep10.reached && ep10.collisions === 0 && (
        <div className="insight-box" style={{ marginTop: '8px', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
          <h3>✅ Reflexes Fully Developed</h3>
          <p>
            The robot has mastered the environment — reaching the destination with
            zero collisions. Avoidance patterns are now instinctive, demonstrating
            true reflex-like behavior.
          </p>
        </div>
      )}
    </div>
  );
}
