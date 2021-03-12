import {
  BOARD_COLS,
  BOARD_ROWS,
  ENTRY_DELAY,
  GHOST_OPACITY,
  LEVEL_DROP_SPEEDS,
  LOCK_DELAY,
  MOVE_RESET_LIMIT,
  NEXT_LEVEL_LINES,
  NEXT_QUEUE_SIZE,
  POINTS_HARD_DROP,
  POINTS_LINE_DOUBLE,
  POINTS_LINE_QUADRUPLE,
  POINTS_LINE_SINGLE,
  POINTS_LINE_TRIPLE,
  POINTS_SOFT_DROP,
} from '../constants.js';
import { arrayShuffle, timeNow } from '../helpers.js';
import { TETROMINOES } from '../tetromino/tetrominoes.js';

const createNextTextrominoQueue = nextTetrominoQueue => {
  if (nextTetrominoQueue.length > NEXT_QUEUE_SIZE) {
    return nextTetrominoQueue;
  }
  const tetrominoBag = arrayShuffle(TETROMINOES);
  return [
    ...nextTetrominoQueue,
    ...tetrominoBag.map(tetromino => {
      const { rotations, y } = tetromino;
      const defaults = {
        ...tetromino,
        rotation: rotations[0],
        rotationIndex: 0,
        maxY: y,
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
  let { board, isFixedLevel, level, score, lines } = state;
  let clears = 0;
  for (let y = BOARD_ROWS - 1; y >= 0; y--) {
    if (board[y].some(x => !x)) {
      continue;
    }
    board.splice(y++, 1);
    board.unshift(Array(BOARD_COLS).fill(null));
    clears++;
  }
  let points = [
    POINTS_LINE_SINGLE,
    POINTS_LINE_DOUBLE,
    POINTS_LINE_TRIPLE,
    POINTS_LINE_QUADRUPLE,
  ][clears - 1];
  if (points) {
    score += points * level;
    lines += clears;
    if (!isFixedLevel) {
      const requiredLines =
        level * NEXT_LEVEL_LINES + (level > 1 ? NEXT_LEVEL_LINES : 0);
      if (lines >= requiredLines) {
        level++;
      }
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

export const checkActiveTetrominoLock = state => {
  const { activeTetromino, lockDelayTime, moveCount } = state;
  const { rotation } = activeTetromino;
  if (
    isTetrominoCollision(state, rotation, 0, 1) &&
    ((lockDelayTime && timeNow() - lockDelayTime > LOCK_DELAY) ||
      moveCount > MOVE_RESET_LIMIT)
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
    lockDelayTime: timeNow(),
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
    lockDelayTime: timeNow(),
    moveCount: moveCount + 1,
  };
};

export const moveActiveTetrominoDown = (state, dropType) => {
  let {
    activeTetromino,
    entryDelayTime,
    lockDelayTime,
    moveCount,
    score,
  } = state;
  let { rotation, y, maxY } = activeTetromino;
  if (timeNow() - entryDelayTime <= ENTRY_DELAY) {
    return state;
  }
  const isHardDrop = dropType === 'hard';
  const isSoftDrop = dropType === 'soft';
  const isMaxGravityDrop = dropType === 'maxGravity';
  const isInputDrop = isHardDrop || isSoftDrop;
  if (!isTetrominoCollision(state, rotation, 0, 1)) {
    if (y > maxY) {
      maxY = y;
      moveCount = 0;
    }
    state = {
      ...state,
      activeTetromino: {
        ...activeTetromino,
        y: y + 1,
        maxY,
      },
      lockDelayTime: 0,
      moveCount,
    };
    if (isInputDrop) {
      score += isHardDrop ? POINTS_HARD_DROP : POINTS_SOFT_DROP;
      state = { ...state, score };
      if (isHardDrop) {
        return moveActiveTetrominoDown(state, dropType);
      }
    } else {
      state = {
        ...state,
        dropTime: timeNow(),
      };
      if (isMaxGravityDrop) {
        return moveActiveTetrominoDown(state, dropType);
      }
    }
    return state;
  }
  if (isHardDrop) {
    return lockActiveTetromino(state);
  }
  if (!lockDelayTime) {
    lockDelayTime = timeNow();
  }
  return {
    ...state,
    activeTetromino,
    lockDelayTime,
  };
};

export const rotateActiveTetromino = (state, isCounterclockwise) => {
  let { activeTetromino, moveCount } = state;
  let { rotations, rotationIndex, kicks } = activeTetromino;
  const newRotationIndex =
    (rotationIndex + (isCounterclockwise ? 3 : 1)) % rotations.length;
  const rotation = rotations[newRotationIndex];
  const directionIndex = isCounterclockwise ? 1 : 0;
  kicks = kicks?.[directionIndex]?.[rotationIndex] ?? [];
  const offsets = [[0, 0], ...kicks];
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
      lockDelayTime: timeNow(),
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
    dropTime: timeNow(),
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
  return {
    ...activeTetromino,
    color: color + GHOST_OPACITY,
    y: y + (offsetY - 1),
  };
};

export const shiftNextTetrominoQueue = state => {
  let { nextTetrominoQueue, level } = state;
  nextTetrominoQueue = createNextTextrominoQueue(nextTetrominoQueue);
  const activeTetromino = nextTetrominoQueue[0];
  if (!getLevelDropSpeed(level)) {
    activeTetromino.y--;
  }
  return {
    ...state,
    activeTetromino,
    nextTetrominoQueue: nextTetrominoQueue.slice(1),
    dropTime: timeNow(),
    entryDelayTime: timeNow(),
    lockDelayTime: 0,
    moveCount: 0,
  };
};
