# NeuroMorph Reflex Navigator

> **Obstacle Avoidance Robot Simulation** — A robot that learns navigation patterns similarly to reflex actions in humans.

## 🧠 Concept

This project demonstrates **neuromorphic-inspired learning**: a robot navigates a dynamic 10×10 grid environment (Warehouse), learning to avoid moving and static obstacles using **Q-learning reinforcement learning**. Over 10 episodes, the robot progresses from random exploration to smooth, collision-free navigation — mirroring how humans develop reflexes through repeated experience.

## 🚀 Quick Start

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```
The backend runs on `http://localhost:8001`.

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend runs on `http://localhost:5174` (or the next available port).

## 🎮 How to Use

1. **Select Mode**: Choose Hospital or Warehouse from the sidebar.
2. **Place Obstacles**: Drag entities (doctors, nurses, boxes, etc.) from the sidebar onto the grid.
3. **Adjust Speed**: Use the speed slider to control simulation speed (0.5x–10x).
4. **Start Training**: Click "Start 10 Episodes" and watch the robot learn.
5. **Observe Learning**: Watch collisions decrease and paths improve across episodes.
6. **Review Analytics**: Check the right panel for metrics, charts, and the before/after comparison.

## 🏗️ Architecture

```
├── backend/
│   ├── main.py           # FastAPI server with WebSocket
│   ├── environment.py    # 10×10 grid simulation logic
│   ├── rl_agent.py       # Q-learning agent
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx       # Main dashboard layout
│   │   ├── components/
│   │   │   ├── Sidebar.jsx           # Mode, speed, controls, entities
│   │   │   ├── SimulationGrid.jsx    # 10×10 grid renderer
│   │   │   ├── MetricsPanel.jsx      # Live metrics display
│   │   │   ├── ChartsPanel.jsx       # Learning progress charts
│   │   │   └── PresentationPanel.jsx # Before/After comparison
│   │   └── ...
│   └── package.json
└── README.md
```

## 🤖 Robot Movement

The robot uses **orientation-aware movement** (no backward movement allowed):
- **Forward**: Move in the direction the robot is facing
- **Turn Left**: Rotate 90° counterclockwise and move
- **Turn Right**: Rotate 90° clockwise and move
- **Wait**: Stay in place (penalized)

## 📊 Reward Structure

| Action | Reward |
|--------|--------|
| Reach destination | +100 |
| Collision | −100 |
| Near miss | −30 |
| Unnecessary stop | −10 |
| Each step | −2 |
| Forward progress | +5 |
| Collision-free completion | +20 |

## 📈 Learning Progression

| Phase | Episodes | Behavior |
|-------|----------|----------|
| Exploration | 1–2 | Random movements, frequent collisions |
| Learning | 3–5 | Developing basic avoidance reflexes |
| Refinement | 6–8 | Improved routes, fewer collisions |
| Mastery | 9–10 | Smooth navigation, zero collisions |
