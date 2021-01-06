import {
  BOARD_COLS,
  BOARD_ROWS,
  GHOST_OPACITY,
  LOCK_DELAY,
  NEXT_QUEUE_SIZE,
  POINTS_DOUBLE,
  POINTS_SINGLE,
  POINTS_TETRIS,
  POINTS_TRIPLE,
} from './constants.js';
import { tetrominoes } from './tetrominoes.js';

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
  let { board, score, lines, level } = state;
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
      points = POINTS_TETRIS;
      break;
  }
  if (points) {
    score += points * (level + 1);
    lines += clears;
    if (lines >= level * 10 + 10) {
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

export const moveActiveTetrominoDown = (state, isHardDrop) => {
  let { activeTetromino } = state;
  let { rotation, y, lockDelay } = activeTetromino;
  if (!isTetrominoCollision(state, rotation, 0, 1)) {
    state = {
      ...state,
      activeTetromino: {
        ...activeTetromino,
        y: y + 1,
        lockDelay: null,
      },
    };
    if (isHardDrop) {
      return moveActiveTetrominoDown(state, true);
    }
    return state;
  }
  if (isHardDrop) {
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

export const rotateActiveTetromino = (state, direction = 1) => {
  let { activeTetromino } = state;
  const { rotations, rotationIndex } = activeTetromino;
  const { length } = rotations;
  if (length < 2) {
    return null;
  }
  const newRotationIndex =
    direction > 0
      ? (rotationIndex + 1) % length
      : (rotationIndex > 0 ? rotationIndex : length) - 1;
  const rotation = rotations[newRotationIndex];
  if (isTetrominoCollision(state, rotation, 0, 0)) {
    return null;
  }
  return {
    activeTetromino: {
      ...activeTetromino,
      rotation: rotations[newRotationIndex],
      rotationIndex: newRotationIndex,
    },
  };
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
  activeTetromino: nextTetrominoQueue[0],
  nextTetrominoQueue: nextTetrominoQueue.slice(1),
});

export const createNextTextrominoQueue = nextTetrominoQueue => {
  if (nextTetrominoQueue.length > NEXT_QUEUE_SIZE) {
    return nextTetrominoQueue;
  }
  const randomTetrominoes = [...tetrominoes].sort(() => Math.random() - 0.5);
  return [
    ...nextTetrominoQueue,
    ...randomTetrominoes.map(tetromino => {
      const { rotations } = tetromino;
      const defaults = {
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
