import random

class QLearningAgent:
    def __init__(self, num_actions=8, learning_rate=0.5, discount_factor=0.9,
                 epsilon=0.9, epsilon_decay=0.72, min_epsilon=0.05):
        self.num_actions = num_actions
        self.lr = learning_rate
        self.gamma = discount_factor
        self.epsilon = epsilon
        self.epsilon_decay = epsilon_decay
        self.min_epsilon = min_epsilon
        self.q_table = {}

    def _key(self, state):
        return str(state)

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

    def learn(self, state, action, reward, next_state, done):
        key = self._key(state)
        nkey = self._key(next_state)
        if key not in self.q_table:
            self.q_table[key] = [0.0] * self.num_actions
        if nkey not in self.q_table:
            self.q_table[nkey] = [0.0] * self.num_actions

        predict = self.q_table[key][action]
        target = reward if done else reward + self.gamma * max(self.q_table[nkey])
        self.q_table[key][action] += self.lr * (target - predict)

    def decay_epsilon(self):
        self.epsilon = max(self.min_epsilon, self.epsilon * self.epsilon_decay)


def extract_state(robot_pos, target_pos, obstacles, path, grid_size=10, carrying_box=False):
    rx, ry = robot_pos
    return (rx, ry, int(carrying_box))
