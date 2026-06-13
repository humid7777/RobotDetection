import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BarChart3 } from 'lucide-react';

const CHART_STYLE = {
  background: 'rgba(17, 24, 39, 0.9)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px',
  fontSize: '0.75rem',
  color: '#94a3b8'
};

function MiniChart({ data, dataKey, color, title }) {
  return (
    <div className="chart-block">
      <h3>{title}</h3>
      <div style={{ width: '100%', height: 100 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="ep" stroke="#64748b" fontSize={10} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={10} tickLine={false} width={35} />
            <Tooltip contentStyle={CHART_STYLE} />
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 2.5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function ChartsPanel({ metrics }) {
  if (!metrics?.reward?.length) return null;

  const data = metrics.reward.map((r, i) => ({
    ep: i + 1,
    reward: r,
    collisions: metrics.collisions?.[i] || 0,
    accuracy: metrics.accuracy?.[i] || 0,
    precision: metrics.precision?.[i] || 0,
    time: metrics.time_taken?.[i] || 0,
    path: metrics.path_length?.[i] || 0,
  }));

  return (
    <div className="charts-panel glass-panel">
      <div className="panel-header">
        <BarChart3 size={16} />
        <h2>Learning Progress</h2>
      </div>

      <MiniChart data={data} dataKey="reward" color="#818cf8" title="Reward vs Episode" />
      <MiniChart data={data} dataKey="collisions" color="#ef4444" title="Collisions vs Episode" />
      <MiniChart data={data} dataKey="accuracy" color="#10b981" title="Accuracy vs Episode" />
      <MiniChart data={data} dataKey="precision" color="#f59e0b" title="Precision vs Episode" />
      <MiniChart data={data} dataKey="time" color="#6366f1" title="Time Taken vs Episode" />
      <MiniChart data={data} dataKey="path" color="#8b5cf6" title="Path Length vs Episode" />
    </div>
  );
}
