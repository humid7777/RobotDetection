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
    // Dynamically switch between local and production URLs
    const WS_URL = import.meta.env.PROD 
      ? 'wss://neuromorphicreflexnavigator.onrender.com/ws/simulation' 
      : 'ws://localhost:8001/ws/simulation';
      
    const socket = new WebSocket(WS_URL);
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
      <header className="app-header glass-panel" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '12px 20px' }}>
        <div className="header-left"></div>
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
          <Activity color="#6366f1" size={26} />
          <h1 style={{ margin: 0 }}>NeuroMorph Reflex Navigator</h1>
        </div>
        <div className="header-status" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', fontWeight: 500, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
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
          ws={ws}
          metrics={gameState?.metrics}
        />

        <div className="center-panel">
          <div className="grid-wrapper glass-panel">
            <div className="panel-header">
              <LayoutDashboard size={16} />
              <h2>Live Simulation — 🏭 Warehouse</h2>
            </div>
            
            <div className="grid-main-row" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              {/* Compact Drag Palette at Top Left of the Grid */}
              <div className="compact-drag-palette" style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '70px', flexShrink: 0, padding: '4px' }}>
                <div
                  className="entity-item compact-item"
                  draggable
                  onDragStart={() => setDraggedEntity({ type: 'box', emoji: '📦', label: 'Box', isDynamic: false })}
                  onDragEnd={() => setDraggedEntity(null)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px 4px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', cursor: 'grab' }}
                >
                  <span className="entity-emoji" style={{ fontSize: '1.6rem' }}>📦</span>
                  <span className="entity-label" style={{ fontSize: '0.7rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Box</span>
                </div>
                
                <div
                  className="entity-item compact-item"
                  draggable
                  onDragStart={() => setDraggedEntity({ type: 'target', emoji: '🏁', label: 'Target', isDynamic: false })}
                  onDragEnd={() => setDraggedEntity(null)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px 4px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', cursor: 'grab' }}
                >
                  <span className="entity-emoji" style={{ fontSize: '1.6rem' }}>🏁</span>
                  <span className="entity-label" style={{ fontSize: '0.7rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Target</span>
                </div>
              </div>

              {gameState?.grid && (
                <SimulationGrid
                  gridData={gameState.grid}
                  step={gameState.step}
                  onDrop={handleCellDrop}
                />
              )}
            </div>

            <div className="how-to-use-panel" style={{ marginTop: '25px', padding: '15px 20px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>💡</span> How to use this simulator
              </h3>
              <ol style={{ margin: 0, paddingLeft: '22px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                <li><strong>Design the Warehouse:</strong> Drag and drop 📦 <strong>Boxes</strong> onto the grid to create walls or obstacles.</li>
                <li><strong>Set the Goal:</strong> Drag the 🏁 <strong>Target</strong> to wherever you want the robot to navigate to.</li>
                <li><strong>Train the Brain:</strong> Click <strong>"Start 10 Episodes"</strong> on the left to watch the AI learn via Q-Learning in real-time.</li>
              </ol>
            </div>

          </div>
        </div>

        <div className="right-panel">
          <MetricsPanel state={gameState} />
          <ChartsPanel metrics={gameState?.metrics} side="right" />
        </div>
      </main>
    </div>
  );
}

export default App;
