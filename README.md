# RobotDetection — RL Navigation Simulator

> **Reinforcement Learning Robot Navigation** — A robot that learns to find the shortest path to a target on a 10×10 grid, avoiding obstacles, using Q-learning.

---

## 🧠 Concept

This project demonstrates **Q-learning reinforcement learning** in action: a robot navigates a 10×10 warehouse grid, learning to avoid static obstacles and reach a target destination. Over 10 episodes, the robot progresses from random exploration to near-optimal, collision-free navigation — the Q-table accumulates experience across all episodes, growing smarter with every run.

Key innovations:
- **8-directional movement** (including diagonals) for shortest-path navigation
- **Experience replay** — the agent replays past transitions 8 times per step for fast convergence
- **Rich state encoding** — robot sees direction to target, obstacle radar, and revisit memory
- **Real-time visualization** — watch the robot learn live in the browser via WebSocket

---

## 🌍 Live Deployment

This project is deployed and fully operational in the cloud:
- **Frontend App**: Deployed on Vercel ( https://neuromorphicreflexnavigator.vercel.app/)
- **AI Backend**: Running on Render (`wss://neuromorphicreflexnavigator.onrender.com/ws/simulation`)

*Real-time communication is handled via WebSockets, allowing you to watch the Q-learning process live from anywhere.*

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**

### Step 1 — Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```
Backend runs on **`http://localhost:8001`**

### Step 2 — Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on **`http://localhost:5175`** (check terminal for the exact port)

### Step 3 — Open in Browser
Navigate to the URL shown in your terminal. The dashboard auto-connects to the backend via WebSocket.

---

## 🎮 How to Use

1. **Place Obstacles**: Drag 📦 **Box** items from the left palette onto the grid.
2. **Place Target**: Drag 🏁 **Target** onto any grid cell. If none is placed, defaults to bottom-right `(9, 9)`.
3. **Adjust Speed**: Use the speed slider (0.5x – 10x).
4. **Start Training**: Click **"Start 10 Episodes"** and watch the robot learn in real time.
5. **Observe Learning**: Collisions decrease, path length shortens, routes become more direct.
6. **Review Analytics**: Check the right panel for live metrics and the path length vs episode chart.
7. **Pause / Reset**: Use **Pause** to stop mid-run, or **Reset All** to clear the grid and start fresh.

---

## 🏗️ Project Structure

```
RobotDetection/
├── backend/
│   ├── main.py              # FastAPI WebSocket server & training loop
│   ├── environment.py       # 10×10 grid simulation, reward logic
│   ├── rl_agent.py          # Q-learning agent with experience replay
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx                      # Main dashboard layout
│   │   ├── components/
│   │   │   ├── Sidebar.jsx              # Controls, speed, entity palette
│   │   │   ├── SimulationGrid.jsx       # Live 10×10 grid renderer
│   │   │   ├── MetricsPanel.jsx         # Live metrics display
│   │   │   └── ChartsPanel.jsx          # Learning progress charts
│   │   └── index.css
│   └── package.json
└── README.md
```

---

## 🤖 Robot Movement — 8 Directions

The robot moves in all **8 compass directions**, including diagonals, allowing it to take the shortest geometric path:

| Action | Direction | Offset (dx, dy) |
|--------|-----------|-----------------|
| `ACTION_RIGHT` | → Right | (1, 0) |
| `ACTION_UP` | ↑ Up | (0, −1) |
| `ACTION_DOWN` | ↓ Down | (0, 1) |
| `ACTION_LEFT` | ← Left | (−1, 0) |
| `ACTION_TR` | ↗ Top-Right | (1, −1) |
| `ACTION_TL` | ↖ Top-Left | (−1, −1) |
| `ACTION_BR` | ↘ Bottom-Right | (1, 1) |
| `ACTION_BL` | ↙ Bottom-Left | (−1, 1) |

Diagonal moves cover two axes in one step, enabling significantly shorter paths.

---


## 📊 Reward Structure

| Condition | Reward |
|-----------|--------|
| Reach the target 🏁 | **+100** |
| Step closer to target | **−1** |
| Step away from target | **−5** |
| Revisit a cell already in path | **−10** |
| Hit grid boundary | **−10** |
| Collide with an obstacle 📦 | **−50** |

### Dynamic Target Adaptation

If the robot exceeds **1000 steps** without reaching the target, the target is automatically relocated to a random free cell and the episode ends. This prevents the agent from getting permanently stuck.

---

## 🧠 Q-Learning Hyperparameters

| Parameter | Value | Notes |
|-----------|-------|-------|
| Learning Rate (α) | 0.5 | Fast value updates |
| Discount Factor (γ) | 0.95 | Values future rewards highly |
| Initial Epsilon (ε) | 1.0 | Full exploration at start |
| Epsilon Decay | 0.75 per episode | Converges to exploitation by episode 10 |
| Min Epsilon | 0.05 | Always keeps 5% exploration |
| Max Steps / Episode | 1000 | Hard per-episode budget |
| Replay Buffer Size | 5000 | Stores past transitions |
| Replay Batch / Step | 32 | Replays 32 random past transitions per step |

### Experience Replay

After every step, the agent samples **32 random past transitions** from a 5000-transition replay buffer and runs Q-table updates on all of them. This multiplies the effective learning signal per step by 33×, enabling the robot to converge to an optimal policy within just 10 episodes.

### State Encoding

The robot's state is a heavily optimized **10-dimensional tuple** encoding exactly what it needs to generalize efficiently without memory bloat (only 2,304 possible states total):
- **Relative direction to target** (`sx`, `sy`) — −1/0/1 on each axis (9 states)
- **8-directional boolean obstacle radar** — `0` free, `1` blocked (256 states)

---

## 📈 Learning Progression

| Phase | Episodes | Behavior |
|-------|----------|----------|
| 🔴 Exploration | 1–3 | Random movements, frequent collisions, building Q-table |
| 🟡 Learning | 4–6 | Developing obstacle avoidance, reducing loops |
| 🟢 Refinement | 7–8 | Shorter, more direct routes |
| ✅ Mastery | 9–10 | Near-optimal path, minimal or zero collisions |

---

## 🔁 Visual Feedback

| Event | Grid Flash |
|-------|-----------|
| Collision with obstacle | 🔴 Red flash |
| Robot path trail | 🔵 Blue-purple dots |
| Target cell | 🟢 Green highlight |
| Robot position | 🤖 Pulsing indigo glow |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, FastAPI, WebSocket |
| RL Algorithm | Q-Learning with Experience Replay |
| Frontend | React (Vite), Vanilla CSS |
| Communication | WebSocket (real-time) |


## 📸 ScreenShots
**1)Full Website interface**

<img width="1917" height="1047" alt="image" src="https://github.com/user-attachments/assets/efa8c2e2-97d6-48bb-ab56-9954116c8e72" />

**2) 10x10 Grid and Drag Box and Target**

<img width="1107" height="955" alt="image" src="https://github.com/user-attachments/assets/0e95bd5f-7a44-47d0-86c9-72d6c708b657" />

**3) Metrics**

<img width="392" height="501" alt="image" src="https://github.com/user-attachments/assets/0b802e1a-1e9f-4d40-b7a3-f14b49bb953c" />


**4) Graphs**

<img width="381" height="555" alt="image" src="https://github.com/user-attachments/assets/3cf6cfe0-0a5e-492d-b8ba-3d0d663553d2" />
<img width="402" height="420" alt="image" src="https://github.com/user-attachments/assets/43bb7f21-fe84-4ac6-8416-d8dece586fd3" />

**5) Controll Buttons**

<img width="387" height="282" alt="image" src="https://github.com/user-attachments/assets/002ee599-a360-4f1c-a3d9-9013aa25163d" />


