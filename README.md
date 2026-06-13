# 🤖 NeuroMorph Reflex Navigator

> **Reinforcement Learning Robot Simulation** — A robot that learns navigation reflexes through Q-learning, navigating a warehouse grid while avoiding obstacles.

## 🧠 Concept

This project demonstrates **neuromorphic-inspired learning**: a robot navigates a **10×10 grid** warehouse environment, learning to avoid static obstacles (📦 boxes) using **Q-learning reinforcement learning**. Over 10 training episodes, the robot progresses from random exploration to smooth, collision-free navigation — mirroring how humans develop reflexes through repeated experience.

The robot supports **8-directional movement** (up, down, left, right, and all four diagonals), allowing it to take the shortest possible paths by cutting corners diagonally.

---

## 🚀 Installation & Setup

### Prerequisites

- **Python 3.10+** — [Download Python](https://www.python.org/downloads/)
- **Node.js 18+** — [Download Node.js](https://nodejs.org/)
- **Git** — [Download Git](https://git-scm.com/)

### Step 1: Clone the Repository

```bash
git clone https://github.com/humid7777/RobotDetection.git
cd RobotDetection
```

### Step 2: Start the Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

The backend API server will start on **`http://localhost:8001`**.

### Step 3: Start the Frontend

Open a **new terminal** (keep the backend running) and run:

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on **`http://localhost:5173`** (or the next available port — check the terminal output).

### Step 4: Open in Browser

Navigate to the URL shown in your frontend terminal (e.g., `http://localhost:5173`). The dashboard will automatically connect to the backend via WebSocket.

---

## 🎮 How to Use

1. **Place Obstacles**: Drag 📦 **Box** items from the left palette onto the grid to create obstacles.
2. **Place Target**: Drag 🏁 **Target** from the left palette onto any grid cell to set the robot's destination. If no target is placed, it defaults to the bottom-right corner `(9, 9)`.
3. **Adjust Speed**: Use the speed slider in the sidebar to control simulation speed (0.5x – 10x).
4. **Start Training**: Click **"Start 10 Episodes"** and watch the robot learn in real time.
5. **Observe Learning**: Watch the robot's collisions decrease and its path become more efficient across episodes.
6. **Review Analytics**: Check the right panel for live metrics, performance charts, and the episode-by-episode comparison table.
7. **Pause / Reset**: Use the **Pause** button to stop training mid-run, or **Reset All** to clear the grid and start fresh.

---

## 🏗️ Project Structure

```
RobotDetection/
├── backend/
│   ├── main.py              # FastAPI WebSocket server & training loop
│   ├── environment.py       # 10×10 grid simulation environment
│   ├── rl_agent.py          # Q-learning agent with epsilon-greedy policy
│   └── requirements.txt     # Python dependencies (fastapi, uvicorn, websockets)
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main dashboard layout with WebSocket connection
│   │   ├── App.css          # Global styles and layout
│   │   ├── index.css        # CSS variables and design tokens
│   │   ├── main.jsx         # React entry point
│   │   └── components/
│   │       ├── Sidebar.jsx           # Speed slider & training controls
│   │       ├── SimulationGrid.jsx    # 10×10 interactive grid renderer
│   │       ├── SimulationGrid.css    # Grid cell styles & flash animations
│   │       ├── MetricsPanel.jsx      # Live episode metrics display
│   │       ├── ChartsPanel.jsx       # Recharts line charts for trends
│   │       └── PresentationPanel.jsx # Ep 1 vs Ep 10 comparison table
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

---

## 🤖 Robot Movement — 8 Directions

The robot moves in all **8 compass directions**, including diagonals:

| Action | Direction | Offset (dx, dy) |
|--------|-----------|------------------|
| `ACTION_RIGHT` | → Right | (1, 0) |
| `ACTION_UP` | ↑ Up | (0, -1) |
| `ACTION_DOWN` | ↓ Down | (0, 1) |
| `ACTION_LEFT` | ← Left | (-1, 0) |
| `ACTION_TR` | ↗ Top-Right | (1, -1) |
| `ACTION_TL` | ↖ Top-Left | (-1, -1) |
| `ACTION_BR` | ↘ Bottom-Right | (1, 1) |
| `ACTION_BL` | ↙ Bottom-Left | (-1, 1) |

Diagonal movement allows the robot to cover two axes in a single step, enabling it to find significantly shorter paths.

---

## 📊 Reward Structure

| Condition | Reward |
|-----------|--------|
| Reach the target 🏁 | **+100** |
| Step closer to target | **-1** (minimal cost) |
| Step away from target | **-5** |
| Revisit a cell already in path | **-10** |
| Hit grid boundary | **-10** |
| Collide with an obstacle 📦 | **-50** |

### Dynamic Target Adaptation

If the robot takes **more than 1000 steps** or its path exceeds **1000 cells**, the target is automatically relocated to a random free cell. This prevents the robot from getting permanently stuck and ensures training keeps progressing.

---

## 📈 Learning Progression

| Phase | Episodes | Behavior |
|-------|----------|----------|
| 🔴 Exploration | 1–2 | Random movements, frequent collisions |
| 🟡 Learning | 3–5 | Developing basic avoidance reflexes |
| 🟢 Refinement | 6–8 | Improved routes, fewer collisions |
| ✅ Mastery | 9–10 | Smooth navigation, zero collisions |

---

## 🧪 Q-Learning Hyperparameters

| Parameter | Value |
|-----------|-------|
| Learning Rate (α) | 0.5 |
| Discount Factor (γ) | 0.9 |
| Initial Epsilon (ε) | 0.9 |
| Epsilon Decay | 0.72 per episode |
| Minimum Epsilon | 0.05 |
| Max Steps per Episode | 2000 |
| Episodes per Run | 10 |

---

## 📉 Dashboard Metrics & Charts

### Live Metrics Panel
- **Success**: Whether the robot reached the target in the current episode
- **Collisions**: Number of times the robot hit an obstacle
- **Precision**: Percentage of moves that resulted in forward progress
- **Path Length**: Total cells visited during the episode
- **Time (steps)**: Total steps taken in the episode
- **Reward**: Cumulative reward for the episode

### Performance Charts (Sidebar)
- **Reward vs Episode** — Shows reward improvement over training
- **Collisions vs Episode** — Shows collision reduction over training
- **Path Length vs Episode** — Shows path optimization over training

### Right Panel Charts
- **Precision vs Episode** — Shows movement efficiency over training
- **Time Taken vs Episode** — Shows speed improvement over training

---

## 🔌 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 8, Recharts, Lucide Icons |
| Backend | Python, FastAPI, Uvicorn |
| Communication | WebSocket (real-time bidirectional) |
| RL Algorithm | Tabular Q-Learning with ε-greedy exploration |

---

## 📜 License

This project was built for a hackathon demonstration of reinforcement learning concepts.
