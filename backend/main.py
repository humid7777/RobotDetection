from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json

from environment import SimulationEnvironment, NUM_ACTIONS
from rl_agent import QLearningAgent

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GRID_SIZE = 10
NUM_EPISODES = 10

env = SimulationEnvironment(grid_size=GRID_SIZE)
agent = QLearningAgent(num_actions=NUM_ACTIONS, learning_rate=0.5, discount_factor=0.95, epsilon=1.0, epsilon_decay=0.75)

is_training = False
current_episode = 0
sim_speed = 100

metrics = {
    "accuracy": [],
    "precision": [],
    "reward": [],
    "collisions": [],
    "stops": [],
    "path_length": [],
    "time_taken": [],
}

episode_summaries = {}
initial_static = []


async def send_state(websocket, state_type="update"):
    grid_state = env.get_grid_state()
    msg = {
        "type": state_type,
        "grid": grid_state,
        "episode": current_episode,
        "step": env.step_count,
        "metrics": metrics,
        "is_training": is_training,
        "speed": sim_speed,
        "total_episodes": NUM_EPISODES,
        "episode_summaries": episode_summaries,
    }
    await websocket.send_text(json.dumps(msg))


async def run_training_loop(websocket):
    global is_training, current_episode, metrics, initial_static, episode_summaries
    is_training = True

    initial_static = [tuple(s) for s in env.static_obstacles]

    for ep in range(1, NUM_EPISODES + 1):
        if not is_training:
            break

        current_episode = ep
        env.static_obstacles = list(initial_static)
        state = env.reset()
        done = False

        ep_reward = 0
        ep_collisions = 0
        ep_forward_progress = 0
        ep_total_moves = 0

        while not done:
            if not is_training:
                break

            action = agent.choose_action(state)
            next_state, reward, done, collision = env.step(action)
            agent.learn(state, action, reward, next_state, done)

            ep_reward += reward
            if collision:
                ep_collisions += 1
            ep_total_moves += 1
            if reward == -1 or reward == 100:  # -1 is step closer, 100 is target reached
                ep_forward_progress += 1

            state = next_state

            await send_state(websocket, "update")
            await asyncio.sleep(sim_speed / 1000.0)

        # Episode complete — keep Q-table, only reset environment
        agent.decay_epsilon()

        reached = (tuple(env.robot_pos) == tuple(env.target_pos))

        metrics["reward"].append(round(ep_reward, 1))
        metrics["collisions"].append(ep_collisions)
        metrics["stops"].append(0)
        metrics["accuracy"].append(100 if reached else 0)
        metrics["time_taken"].append(env.step_count)
        metrics["path_length"].append(len(env.path))
        precision = round((ep_forward_progress / max(1, ep_total_moves)) * 100)
        metrics["precision"].append(precision)

        episode_summaries[str(ep)] = {
            "reached": reached,
            "collisions": ep_collisions,
            "reward": round(ep_reward, 1),
            "steps": env.step_count,
            "path_length": len(env.path),
            "precision": precision,
            "path": [list(p) for p in env.path],
        }

        await send_state(websocket, "episode_end")
        await asyncio.sleep(1.5)

    is_training = False
    await send_state(websocket, "training_complete")


@app.websocket("/ws/simulation")
async def simulation_ws(websocket: WebSocket):
    global is_training, current_episode, env, agent, sim_speed
    global metrics, initial_static, episode_summaries
    await websocket.accept()
    await send_state(websocket, "init")

    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)

            if msg["action"] == "start_training":
                if not is_training:
                    asyncio.create_task(run_training_loop(websocket))

            elif msg["action"] == "pause":
                is_training = False
                await send_state(websocket, "update")

            elif msg["action"] == "reset":
                is_training = False
                current_episode = 0
                env = SimulationEnvironment(grid_size=GRID_SIZE)
                agent = QLearningAgent(num_actions=NUM_ACTIONS, learning_rate=0.5, discount_factor=0.95, epsilon=1.0, epsilon_decay=0.75)
                metrics = {k: [] for k in metrics}
                initial_static = []
                episode_summaries = {}
                env.reset()
                await send_state(websocket, "update")

            elif msg["action"] == "set_speed":
                sim_speed = int(msg["speed"])
                await send_state(websocket, "update")

            elif msg["action"] == "place_entity":
                t = msg["type"]
                x, y = msg["x"], msg["y"]
                if t == "target":
                    env.target_pos = (x, y)
                else:
                    env.static_obstacles.append((x, y))
                await send_state(websocket, "update")

    except WebSocketDisconnect:
        is_training = False
        print("Client disconnected")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
