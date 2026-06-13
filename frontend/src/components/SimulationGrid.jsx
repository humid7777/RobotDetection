import React, { useState, useEffect } from 'react';
import './SimulationGrid.css';

const EMOJI_MAP = {
  'worker': '👷', 'forklift': '🚜', 'cart': '🛒',
  'box': '📦', 'pallet': '🪵', 'target': '🏁'
};

export default function SimulationGrid({ gridData, step, onDrop }) {
  const { robot, target, static: staticObs, grid_size, path, collision_cell, pickup_cell, drop_cell, carrying_box } = gridData;
  const [flashingCell, setFlashingCell] = useState(null);
  const [flashingPickup, setFlashingPickup] = useState(null);
  const [flashingDrop, setFlashingDrop] = useState(null);

  useEffect(() => {
    if (collision_cell) {
      setFlashingCell({ x: collision_cell[0], y: collision_cell[1], step });
      const timer = setTimeout(() => setFlashingCell(null), 500);
      return () => clearTimeout(timer);
    }
  }, [collision_cell, step]);

  useEffect(() => {
    if (pickup_cell) {
      setFlashingPickup({ x: pickup_cell[0], y: pickup_cell[1], step });
      const timer = setTimeout(() => setFlashingPickup(null), 500);
      return () => clearTimeout(timer);
    }
  }, [pickup_cell, step]);

  useEffect(() => {
    if (drop_cell) {
      setFlashingDrop({ x: drop_cell[0], y: drop_cell[1], step });
      const timer = setTimeout(() => setFlashingDrop(null), 500);
      return () => clearTimeout(timer);
    }
  }, [drop_cell, step]);

  const pathSet = new Set((path || []).map(p => `${p[0]},${p[1]}`));

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e, x, y) => { e.preventDefault(); onDrop(x, y); };

  const cells = [];
  for (let y = 0; y < grid_size; y++) {
    for (let x = 0; x < grid_size; x++) {
      let content = null;
      let className = "grid-cell";

      if (pathSet.has(`${x},${y}`)) {
        className += " cell-path";
      }

      let cellKey = `${x}-${y}`;
      if (flashingCell && flashingCell.x === x && flashingCell.y === y) {
        className += " cell-collision";
        cellKey = `${x}-${y}-flash-${flashingCell.step}`;
      } else if (flashingPickup && flashingPickup.x === x && flashingPickup.y === y) {
        className += " cell-pickup";
        cellKey = `${x}-${y}-pickup-${flashingPickup.step}`;
      } else if (flashingDrop && flashingDrop.x === x && flashingDrop.y === y) {
        className += " cell-drop";
        cellKey = `${x}-${y}-drop-${flashingDrop.step}`;
      }

      if (robot && robot[0] === x && robot[1] === y) {
        content = (
          <div className="robot-container">
            <span className="robot-emoji">🤖</span>
            {carrying_box && <span className="carrying-badge">📦</span>}
          </div>
        );
        className += " cell-robot";
      } else if (target && target[0] === x && target[1] === y) {
        content = '🏁';
        className += " cell-target";
      } else {
        const sObj = staticObs?.find(s => s[0] === x && s[1] === y);
        if (sObj) {
          content = '📦';
          className += " cell-static";
        }
      }

      cells.push(
        <div
          key={cellKey}
          className={className}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, x, y)}
        >
          {content}
        </div>
      );
    }
  }

  return (
    <div className="grid-board" style={{ gridTemplateColumns: `repeat(${grid_size}, 1fr)` }}>
      {cells}
    </div>
  );
}
