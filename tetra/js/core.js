import {
  BOARD_COLS,
  BOARD_ROWS,
  GHOST_OPACITY,
  LOCK_DELAY,
  NEXT_QUEUE_SIZE,
  POINTS_DOUBLE,
  POINTS_QUADRUPLE,
  POINTS_SINGLE,
  POINTS_TRIPLE,
  SPAWN_DELAY,
  TETROMINOES,
} from './constants.js';

const isTetrominoCollision = (state, rotation, offsetX, offsetY) => {
  const { board, activeTetromino } = state;
  for (let y = 0, len = rotation.length; y < len; y++) {
    for (let x = 0; x < len; x++) {
      if (!rotation[y][x]) {
        continue;
      }
      const newX = activeTetromino.x + x + offsetX;
      const newY = activeTetromino.y + y + offsetY;
      if (newX < 0 || newX >= BOARD_COLS || newY >= BOARD_ROWS) {
        return true;
      }
      if (newY < 0) {
        continue;
      }
      if (board[newY][newX]) {
        return true;
      }
    }
  }
  return false;
};

const clearLines = state => {
  let { board, level, score, lines } = state;
  let clears = 0;
  for (let y = BOARD_ROWS - 1; y >= 0; y--) {
    if (board[y].some(x => !x)) {
      continue;
    }
    board.splice(y++, 1);
    board.unshift(Array(BOARD_COLS).fill(null));
    clears++;
  }
  let points = 0;
  switch (clears) {
    case 1:
      points = POINTS_SINGLE;
      break;
    case 2:
      points = POINTS_DOUBLE;
      break;
    case 3:
      points = POINTS_TRIPLE;
      break;
    case 4:
      points = POINTS_QUADRUPLE;
      break;
  }
  if (points) {
    score += points * level;
    lines += clears;
    const targetLines = level * 10 + (level > 1 ? 10 : 0);
    if (lines >= targetLines) {
      level++;
    }
  }
  return {
    board,
    score,
    lines,
    level,
  };
};

export const lockActiveTetromino = state => {
  let { activeTetromino, isGameOver } = state;
  const { color, rotation } = activeTetromino;
  const board = [...state.board];
  for (let y = 0, len = rotation.length; y < len; y++) {
    for (let x = 0; x < len; x++) {
      if (!rotation[y][x]) {
        continue;
      }
      if (activeTetromino.y + y < 1) {
        isGameOver = true;
        break;
      }
      board[activeTetromino.y + y][activeTetromino.x + x] = color;
    }
  }
  return {
    ...clearLines(state),
    inputQueue: [],
    activeTetromino: {
      ...activeTetromino,
      lockDelay: null,
      isLocked: true,
    },
    isHoldUsed: false,
    isGameOver,
  };
};

export const isTetrominoLockable = state => {
  const { activeTetromino } = state;
  const { rotation, lockDelay } = activeTetromino;
  return (
    lockDelay &&
    performance.now() - lockDelay > LOCK_DELAY &&
    isTetrominoCollision(state, rotation, 0, 1)
  );
};

export const moveActiveTetrominoLeft = state => {
  let { activeTetromino } = state;
  const { rotation, x } = activeTetromino;
  if (isTetrominoCollision(state, rotation, -1, 0)) {
    return null;
  }
  return {
    activeTetromino: {
      ...activeTetromino,
      x: x - 1,
      lockDelay: null,
    },
  };
};

export const moveActiveTetrominoRight = state => {
  let { activeTetromino } = state;
  const { rotation, x } = activeTetromino;
  if (isTetrominoCollision(state, rotation, 1, 0)) {
    return null;
  }
  return {
    activeTetromino: {
      ...activeTetromino,
      x: x + 1,
      lockDelay: null,
    },
  };
};

export const moveActiveTetrominoDown = (state, dropType) => {
  let { activeTetromino } = state;
  let { rotation, y, spawnDelay, lockDelay } = activeTetromino;
  if (
    !isTetrominoCollision(state, rotation, 0, 1) &&
    performance.now() - spawnDelay > SPAWN_DELAY
  ) {
    state = {
      ...state,
      activeTetromino: {
        ...activeTetromino,
        y: y + 1,
        lockDelay: null,
      },
    };
    if (dropType === 'hard' || dropType === 'sonic') {
      return moveActiveTetrominoDown(state, dropType);
    }
    return state;
  }
  if (dropType === 'hard') {
    return lockActiveTetromino(state);
  }
  lockDelay ??= performance.now();
  return {
    ...state,
    activeTetromino: {
      ...activeTetromino,
      lockDelay,
    },
  };
};

export const rotateActiveTetromino = (state, isCounterclockwise) => {
  let { activeTetromino } = state;
  const { rotations, rotationIndex, wallKicks } = activeTetromino;
  const { length } = rotations;
  if (length < 2) {
    return null;
  }
  const newRotationIndex = isCounterclockwise
    ? (rotationIndex > 0 ? rotationIndex : length) - 1
    : (rotationIndex + 1) % length;
  const rotation = rotations[newRotationIndex];
  const directionIndex = isCounterclockwise ? 1 : 0;
  const offsets = [[0, 0], ...wallKicks[directionIndex][newRotationIndex]];
  for (let i = 0, len = offsets.length; i < len; i++) {
    const [x, y] = offsets[i];
    if (isTetrominoCollision(state, rotation, x, y)) {
      continue;
    }
    return {
      activeTetromino: {
        ...activeTetromino,
        rotation: rotations[newRotationIndex],
        rotationIndex: newRotationIndex,
        x: activeTetromino.x + x,
        y: activeTetromino.y + y,
      },
    };
  }
  return null;
};

export const holdActiveTetromino = state => {
  let {
    nextTetrominoQueue,
    activeTetromino,
    holdTetromino,
    isHoldUsed,
  } = state;
  if (isHoldUsed) {
    return null;
  }
  if (!holdTetromino) {
    holdTetromino = activeTetromino;
    ({ nextTetrominoQueue, activeTetromino } = shiftNextTetrominoQueue(
      nextTetrominoQueue,
    ));
  } else {
    const prevActiveTetromino = activeTetromino;
    activeTetromino = holdTetromino;
    holdTetromino = prevActiveTetromino;
  }
  return {
    nextTetrominoQueue,
    activeTetromino,
    holdTetromino: {
      ...holdTetromino,
      ...holdTetromino.defaults,
    },
    isHoldUsed: true,
  };
};

export const createGhostTetromino = state => {
  const { activeTetromino } = state;
  const { color, rotation, y } = activeTetromino;
  let offsetY = 1;
  while (!isTetrominoCollision(state, rotation, 0, offsetY)) {
    offsetY++;
  }
  offsetY--;
  return {
    ...activeTetromino,
    color: color + GHOST_OPACITY,
    y: y + offsetY,
  };
};

export const shiftNextTetrominoQueue = nextTetrominoQueue => ({
  activeTetromino: {
    ...nextTetrominoQueue[0],
    spawnDelay: performance.now(),
  },
  nextTetrominoQueue: nextTetrominoQueue.slice(1),
});

export const createNextTextrominoQueue = nextTetrominoQueue => {
  if (nextTetrominoQueue.length > NEXT_QUEUE_SIZE) {
    return nextTetrominoQueue;
  }
  const randomTetrominoes = [...TETROMINOES].sort(() => Math.random() - 0.5);
  return [
    ...nextTetrominoQueue,
    ...randomTetrominoes.map(tetromino => {
      const { rotations } = tetromino;
      const defaults = {
        ...tetromino,
        rotation: rotations[0],
        rotationIndex: 0,
      };
      return {
        ...tetromino,
        ...defaults,
        defaults,
      };
    }),
  ];
};
