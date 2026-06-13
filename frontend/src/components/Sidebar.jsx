import React, { useState } from 'react';
import { Play, Square, RotateCcw, Gauge } from 'lucide-react';
import ChartsPanel from './ChartsPanel';

export default function Sidebar({ onStart, onPause, onReset, isTraining, ws, metrics }) {
  const [speed, setSpeed] = useState(100);

  const handleSpeedChange = (e) => {
    const val = parseInt(e.target.value);
    setSpeed(val);
    ws?.send(JSON.stringify({ action: "set_speed", speed: val }));
  };

  const getSpeedLabel = () => {
    if (speed >= 175) return '0.5x';
    if (speed >= 75) return '1x';
    if (speed >= 35) return '2x';
    if (speed >= 15) return '4x';
    return '10x';
  };

  return (
    <aside className="sidebar glass-panel">
      <div className="controls-group">
        <h3><Gauge size={12} style={{display:'inline', verticalAlign:'middle'}} /> Robot Speed</h3>
        <div className="speed-control">
          <input
            type="range" min="10" max="200"
            value={speed} onChange={handleSpeedChange}
            className="speed-slider"
          />
          <span className="speed-label">{getSpeedLabel()}</span>
        </div>
      </div>

      <div className="controls-group">
        <h3>Controls</h3>
        <button className="btn btn-primary" onClick={onStart} disabled={isTraining}>
          <Play size={15} /> Start 10 Episodes
        </button>
        <button className="btn btn-danger" onClick={onPause} disabled={!isTraining}>
          <Square size={15} /> Pause
        </button>
        <button className="btn btn-outline" onClick={onReset} disabled={isTraining}>
          <RotateCcw size={15} /> Reset All
        </button>
      </div>

      {metrics?.reward?.length > 0 && (
        <ChartsPanel metrics={metrics} side="left" />
      )}
    </aside>
  );
}
