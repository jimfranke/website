import {
  BOARD_COLS,
  BOARD_ROWS,
  GHOST_OPACITY,
  LEVEL_DROP_SPEEDS,
  LOCK_DELAY,
  MAX_MOVE_RESETS,
  NEXT_QUEUE_SIZE,
  POINTS_DOUBLE,
  POINTS_QUADRUPLE,
  POINTS_SINGLE,
  POINTS_TRIPLE,
} from '../constants.js';
import { arrayShuffle } from '../helpers.js';
import { TETROMINOES } from '../tetromino/tetrominoes.js';

const createNextTextrominoQueue = nextTetrominoQueue => {
  if (nextTetrominoQueue.length > NEXT_QUEUE_SIZE) {
    return nextTetrominoQueue;
  }
  return [
    ...nextTetrominoQueue,
    ...arrayShuffle(TETROMINOES).map(tetromino => {
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

const isTetrominoCollision = (state, rotation, offsetX, offsetY) => {
  const { board, activeTetromino } = state;
  for (let y = 0, l = rotation.length; y < l; y++) {
    for (let x = 0; x < l; x++) {
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
    const requiredLines = level * 10 + (level > 1 ? 10 : 0);
    if (lines >= requiredLines) {
      level++;
    }
  }
  return { board, score, lines, level };
};

export const getLevelDropSpeed = level =>
  LEVEL_DROP_SPEEDS[level - 1] ??
  LEVEL_DROP_SPEEDS[LEVEL_DROP_SPEEDS.length - 1];

export const lockActiveTetromino = state => {
  let { activeTetromino, isGameOver } = state;
  const { color, rotation } = activeTetromino;
  const board = [...state.board];
  for (let y = 0, l = rotation.length; y < l; y++) {
    for (let x = 0; x < l; x++) {
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
  state = clearLines(state);
  return {
    ...state,
    inputQueue: [],
    activeTetromino: {
      ...activeTetromino,
      isLocked: true,
    },
    isHoldUsed: false,
    isGameOver,
  };
};

export const isTetrominoLockable = state => {
  const { activeTetromino, delayTime, moveCount } = state;
  const { rotation } = activeTetromino;
  if (
    isTetrominoCollision(state, rotation, 0, 1) &&
    ((delayTime && performance.now() - delayTime > LOCK_DELAY) ||
      moveCount > MAX_MOVE_RESETS)
  ) {
    return lockActiveTetromino(state);
  }
  return state;
};

export const moveActiveTetrominoLeft = state => {
  let { activeTetromino, moveCount } = state;
  const { rotation, x } = activeTetromino;
  if (isTetrominoCollision(state, rotation, -1, 0)) {
    return null;
  }
  return {
    activeTetromino: {
      ...activeTetromino,
      x: x - 1,
    },
    delayTime: performance.now(),
    moveCount: moveCount + 1,
  };
};

export const moveActiveTetrominoRight = state => {
  let { activeTetromino, moveCount } = state;
  const { rotation, x } = activeTetromino;
  if (isTetrominoCollision(state, rotation, 1, 0)) {
    return null;
  }
  return {
    activeTetromino: {
      ...activeTetromino,
      x: x + 1,
    },
    delayTime: performance.now(),
    moveCount: moveCount + 1,
  };
};

export const moveActiveTetrominoDown = (state, dropType) => {
  let { activeTetromino, delayTime } = state;
  let { rotation, y } = activeTetromino;
  if (!isTetrominoCollision(state, rotation, 0, 1)) {
    state = {
      ...state,
      activeTetromino: {
        ...activeTetromino,
        y: y + 1,
      },
      delayTime: 0,
      moveCount: 0,
    };
    if (dropType) {
      return moveActiveTetrominoDown(state, dropType);
    }
    return state;
  }
  if (dropType === 'hard') {
    return lockActiveTetromino(state);
  }
  if (!delayTime) {
    delayTime = performance.now();
  }
  return {
    ...state,
    activeTetromino,
    delayTime,
  };
};

export const rotateActiveTetromino = (state, isCounterclockwise) => {
  let { activeTetromino, moveCount } = state;
  let { rotations, rotationIndex, kicks } = activeTetromino;
  const { length } = rotations;
  const newRotationIndex =
    (rotationIndex + (isCounterclockwise ? 3 : 1)) % length;
  const rotation = rotations[newRotationIndex];
  const directionIndex = isCounterclockwise ? 1 : 0;
  const offsets = [[0, 0], ...(kicks?.[directionIndex]?.[rotationIndex] ?? [])];
  for (let i = 0, l = offsets.length; i < l; i++) {
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
      delayTime: performance.now(),
      moveCount: moveCount + 1,
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
    ({ nextTetrominoQueue, activeTetromino } = shiftNextTetrominoQueue(state));
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

export const shiftNextTetrominoQueue = state => {
  let { nextTetrominoQueue, activeTetromino } = state;
  nextTetrominoQueue = createNextTextrominoQueue(nextTetrominoQueue);
  state = { activeTetromino } = {
    ...state,
    activeTetromino: { ...nextTetrominoQueue[0] },
    nextTetrominoQueue: nextTetrominoQueue.slice(1),
    delayTime: 0,
    moveCount: 0,
  };
  const { rotation, y } = activeTetromino;
  let offsetY = 0;
  if (isTetrominoCollision(state, rotation, 0, offsetY)) {
    offsetY--;
  }
  return {
    ...state,
    activeTetromino: {
      ...activeTetromino,
      y: y + offsetY,
    },
  };
};
