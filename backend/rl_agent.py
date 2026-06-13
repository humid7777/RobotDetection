import random
from collections import deque

class QLearningAgent:
    def __init__(self, num_actions=8, learning_rate=0.5, discount_factor=0.95,
                 epsilon=1.0, epsilon_decay=0.75, min_epsilon=0.05):
        self.num_actions = num_actions
        self.lr = learning_rate
        self.gamma = discount_factor
        self.epsilon = epsilon
        self.epsilon_decay = epsilon_decay
        self.min_epsilon = min_epsilon
        self.q_table = {}

        # Experience replay buffer — stores last 2000 transitions
        # Replaying past experiences multiple times per step is the single
        # biggest boost to learning speed for a tabular Q-learner.
        self.replay_buffer = deque(maxlen=5000)
        self.replay_batch = 32  # Increase replay batch for faster learning

    def _key(self, state):
        return state  # state is a tuple, already hashable

    def choose_action(self, state):
        key = self._key(state)
        if key not in self.q_table:
            self.q_table[key] = [0.0] * self.num_actions

        if random.uniform(0, 1) < self.epsilon:
            return random.randint(0, self.num_actions - 1)
        else:
            q = self.q_table[key]
            mx = max(q)
            best = [i for i in range(self.num_actions) if q[i] == mx]
            return random.choice(best)

    def _update(self, state, action, reward, next_state, done):
        """Single Q-table update."""
        key = self._key(state)
        nkey = self._key(next_state)
        if key not in self.q_table:
            self.q_table[key] = [0.0] * self.num_actions
        if nkey not in self.q_table:
            self.q_table[nkey] = [0.0] * self.num_actions

        predict = self.q_table[key][action]
        target = reward if done else reward + self.gamma * max(self.q_table[nkey])
        self.q_table[key][action] += self.lr * (target - predict)

    def learn(self, state, action, reward, next_state, done):
        # Store in replay buffer
        self.replay_buffer.append((state, action, reward, next_state, done))

        # Learn from current transition
        self._update(state, action, reward, next_state, done)

        # Replay a random batch of past transitions for faster convergence
        if len(self.replay_buffer) >= self.replay_batch:
            batch = random.sample(self.replay_buffer, self.replay_batch)
            for s, a, r, ns, d in batch:
                self._update(s, a, r, ns, d)

    def decay_epsilon(self):
        self.epsilon = max(self.min_epsilon, self.epsilon * self.epsilon_decay)


def extract_state(robot_pos, target_pos, obstacles, path, grid_size=10, carrying_box=False):
    """
    Simplified State Encoding (Massively reduces state space for faster learning):
    - Relative direction to target (sx, sy): -1/0/1 on each axis (9 states)
    - 8-directional boolean obstacle radar: 0=free, 1=blocked (256 states)
    Total states: 9 * 256 = 2304 states.
    Small enough for tabular Q-learning to master in 10 episodes.
    """
    rx, ry = robot_pos
    tx, ty = target_pos

    # Relative direction to target
    dx = tx - rx
    dy = ty - ry
    sx = (1 if dx > 0 else (-1 if dx < 0 else 0))
    sy = (1 if dy > 0 else (-1 if dy < 0 else 0))

    # 8-directional boolean obstacle radar (1 step away)
    directions = [(1,0),(0,-1),(0,1),(-1,0),(1,-1),(-1,-1),(1,1),(-1,1)]
    radar = []
    for ddx, ddy in directions:
        nx, ny = rx + ddx, ry + ddy
        if not (0 <= nx < grid_size and 0 <= ny < grid_size):
            radar.append(1)   # blocked (wall)
        elif (nx, ny) in obstacles:
            radar.append(1)   # blocked (obstacle)
        else:
            radar.append(0)   # free

    return (sx, sy) + tuple(radar)
