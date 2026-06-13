import React, { useState, useEffect } from 'react';
import { Activity, LayoutDashboard } from 'lucide-react';
import './App.css';

import Sidebar from './components/Sidebar';
import SimulationGrid from './components/SimulationGrid';
import MetricsPanel from './components/MetricsPanel';
import ChartsPanel from './components/ChartsPanel';
import PresentationPanel from './components/PresentationPanel';

function App() {
  const [ws, setWs] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [draggedEntity, setDraggedEntity] = useState(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8001/ws/simulation');
    socket.onopen = () => console.log('Connected to backend');
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setGameState(data);
    };
    setWs(socket);
    return () => socket.close();
  }, []);

  const handleStart = () => ws?.send(JSON.stringify({ action: "start_training" }));
  const handlePause = () => ws?.send(JSON.stringify({ action: "pause" }));
  const handleReset = () => ws?.send(JSON.stringify({ action: "reset" }));

  const handleCellDrop = (x, y) => {
    if (!draggedEntity || !ws) return;
    ws.send(JSON.stringify({
      action: "place_entity",
      type: draggedEntity.type,
      x, y,
      is_dynamic: draggedEntity.isDynamic
    }));
  };

  const ep = gameState?.episode || 0;
  const total = gameState?.total_episodes || 10;

  return (
    <div className="app-container">
      <header className="app-header glass-panel">
        <div className="logo">
          <Activity color="#6366f1" size={26} />
          <h1>NeuroMorph Reflex Navigator</h1>
        </div>
        <div className="header-center">
          <span className="episode-badge">
            Episode {ep} / {total}
          </span>
        </div>
        <div className="header-status">
          <span className={`status-dot ${gameState?.is_training ? 'active' : ''}`}></span>
          {gameState?.is_training ? 'Training Active' : 'Idle'}
        </div>
      </header>

      <main className="app-main">
        <Sidebar
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
          isTraining={gameState?.is_training}
          setDraggedEntity={setDraggedEntity}
          ws={ws}
        />

        <div className="center-panel">
          <div className="grid-wrapper glass-panel">
            <div className="panel-header">
              <LayoutDashboard size={16} />
              <h2>Live Simulation — 🏭 Warehouse</h2>
            </div>
            {gameState?.grid && (
              <SimulationGrid
                gridData={gameState.grid}
                step={gameState.step}
                onDrop={handleCellDrop}
              />
            )}
          </div>
        </div>

        <div className="right-panel">
          <MetricsPanel state={gameState} />
          <ChartsPanel metrics={gameState?.metrics} />
          <PresentationPanel summaries={gameState?.episode_summaries} />
        </div>
      </main>
    </div>
  );
}

export default App;
