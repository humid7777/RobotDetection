# Actions: Right, Up, Down, Left + Diagonals
ACTION_RIGHT = 0
ACTION_UP = 1
ACTION_DOWN = 2
ACTION_LEFT = 3
ACTION_TR = 4
ACTION_TL = 5
ACTION_BR = 6
ACTION_BL = 7
NUM_ACTIONS = 8

class SimulationEnvironment:
    def __init__(self, grid_size=10):
        self.grid_size = grid_size
        self.robot_pos = (0, 0)
        self.target_pos = None  # User will drag to place, starts empty
        self.static_obstacles = []  # All obstacles are static
        self.step_count = 0
        self.max_steps = 1000  # Per-episode budget
        self.path = []
        self.path_set = set()  # O(1) revisit checking
        self.collision_cell = None
        self.pickup_cell = None
        self.drop_cell = None
        self.carrying_box = False

    def reset(self):
        self.robot_pos = (0, 0)
        self.step_count = 0
        self.path = [self.robot_pos]
        self.path_set = {self.robot_pos}
        self.collision_cell = None
        self.pickup_cell = None
        self.drop_cell = None
        self.carrying_box = False
        if self.target_pos is None:
            self.target_pos = (self.grid_size - 1, self.grid_size - 1)
        return self._get_state()

    def _get_state(self):
        from rl_agent import extract_state
        obs_set = set(tuple(s) for s in self.static_obstacles)
        return extract_state(self.robot_pos, self.target_pos, obs_set, self.path, self.grid_size, self.carrying_box)

    def step(self, action_idx):
        self.step_count += 1
        self.collision_cell = None
        self.pickup_cell = None
        self.drop_cell = None

        reward = -1  # Step cost
        done = False
        collision = False

        if action_idx == ACTION_RIGHT:
            dx, dy = 1, 0
        elif action_idx == ACTION_UP:
            dx, dy = 0, -1
        elif action_idx == ACTION_DOWN:
            dx, dy = 0, 1
        elif action_idx == ACTION_LEFT:
            dx, dy = -1, 0
        elif action_idx == ACTION_TR:
            dx, dy = 1, -1
        elif action_idx == ACTION_TL:
            dx, dy = -1, -1
        elif action_idx == ACTION_BR:
            dx, dy = 1, 1
        elif action_idx == ACTION_BL:
            dx, dy = -1, 1
        else:
            dx, dy = 0, 0

        nx, ny = self.robot_pos[0] + dx, self.robot_pos[1] + dy

        # Bounds check
        if not (0 <= nx < self.grid_size and 0 <= ny < self.grid_size):
            nx, ny = self.robot_pos
            reward = -10
        else:
            # Obstacle check
            obs_set = set(tuple(s) for s in self.static_obstacles)
            if (nx, ny) in obs_set:
                self.collision_cell = (nx, ny)
                nx, ny = self.robot_pos
                reward = -50  # Keep collision penalty high
                collision = True

        if nx != self.robot_pos[0] or ny != self.robot_pos[1]:
            # It actually moved
            if (nx, ny) in self.path_set:
                reward = -20  # Stronger loop penalty — discourage going in circles
            else:
                # Chebyshev distance-based reward shaping (works well with diagonals)
                old_dist = max(abs(self.target_pos[0] - self.robot_pos[0]),
                               abs(self.target_pos[1] - self.robot_pos[1]))
                new_dist = max(abs(self.target_pos[0] - nx),
                               abs(self.target_pos[1] - ny))
                if new_dist < old_dist:
                    reward = 2   # Positive nudge for getting closer
                else:
                    reward = -3  # Mild penalty for moving away

            self.robot_pos = (nx, ny)
            self.path.append(self.robot_pos)
            self.path_set.add(self.robot_pos)

        # Dynamic target adaptation (relocate target if robot is taking too long)
        if self.step_count >= self.max_steps:
            import random
            obs_set = set(tuple(s) for s in self.static_obstacles)
            possible_cells = [
                (x, y) for x in range(self.grid_size) for y in range(self.grid_size)
                if (x, y) != self.robot_pos and (x, y) not in obs_set
            ]
            if possible_cells:
                self.target_pos = random.choice(possible_cells)
            # Episode ends — target relocation triggers done below

        # Target reached
        if self.robot_pos == tuple(self.target_pos):
            reward = 500  # Big reward for success
            done = True

        # Timeout
        if self.step_count >= self.max_steps:
            done = True

        return self._get_state(), reward, done, collision

    def get_grid_state(self):
        return {
            "robot": list(self.robot_pos),
            "target": list(self.target_pos) if self.target_pos else None,
            "static": [list(s) if isinstance(s, (list, tuple)) else s for s in self.static_obstacles],
            "grid_size": self.grid_size,
            "path": [list(p) for p in self.path],
            "collision_cell": list(self.collision_cell) if self.collision_cell else None,
            "pickup_cell": None,
            "drop_cell": None,
            "carrying_box": False,
        }
