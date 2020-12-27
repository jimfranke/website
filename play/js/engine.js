import { BOARD_COLS, BOARD_ROWS } from './constants.js';
import { tetrominoes } from './srs/tetrominoes.js';

const tetrominoCollision = (state, rotation, offsetX, offsetY) => {
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

const lockActiveTetromino = state => {
  let { activeTetromino, isGameOver } = state;
  const { color, rotation } = activeTetromino;
  const board = [...state.board];
  for (let y = 0, len = rotation.length; y < len; y++) {
    for (let x = 0; x < len; x++) {
      if (!rotation[y][x]) {
        continue;
      }
      if (activeTetromino.y + y < 1) {
        isGameOver = false;
        break;
      }
      board[activeTetromino.y + y][activeTetromino.x + x] = color;
    }
  }
  let score = 0;
  let lines = 0;
  for (let y = BOARD_ROWS - 1; y >= 0; y--) {
    if (board[y].some(x => !x)) {
      continue;
    }
    board.splice(y++, 1);
    board.unshift(Array(BOARD_COLS).fill(null));
    lines++;
    score += 100 * lines;
  }
  score += state.score;
  lines += state.lines;
  return {
    board,
    activeTetromino: {
      ...activeTetromino,
      isLocked: true,
    },
    isGameOver,
    isHoldUsed: false,
    score,
    lines,
  };
};

export const moveActiveTetrominoLeft = state => {
  const { activeTetromino } = state;
  if (tetrominoCollision(state, activeTetromino.rotation, -1, 0)) {
    return null;
  }
  return {
    activeTetromino: {
      ...activeTetromino,
      x: activeTetromino.x - 1,
    },
  };
};

export const moveActiveTetrominoRight = state => {
  const { activeTetromino } = state;
  if (tetrominoCollision(state, activeTetromino.rotation, 1, 0)) {
    return null;
  }
  return {
    activeTetromino: {
      ...activeTetromino,
      x: activeTetromino.x + 1,
    },
  };
};

export const moveActiveTetrominoDown = (state, isHard) => {
  const { activeTetromino } = state;
  const { y } = activeTetromino;
  if (tetrominoCollision(state, activeTetromino.rotation, 0, 1)) {
    return lockActiveTetromino(state);
  }
  const nextState = {
    activeTetromino: {
      ...activeTetromino,
      y: y + 1,
    },
  };
  if (isHard) {
    state = { ...state, ...nextState };
    return moveActiveTetrominoDown(state, true);
  }
  return nextState;
};

export const rotateActiveTetromino = (state, direction = 1) => {
  const { activeTetromino } = state;
  const { rotations, rotationIndex, wallKicks } = activeTetromino;
  const { length } = rotations;
  if (length < 2) {
    return null;
  }
  const newRotationIndex =
    direction > 0
      ? (rotationIndex + 1) % length
      : (rotationIndex > 0 ? rotationIndex : length) - 1;
  const rotation = rotations[newRotationIndex];
  if (!tetrominoCollision(state, rotation, 0, 0)) {
    return {
      activeTetromino: {
        ...activeTetromino,
        rotation: rotations[newRotationIndex],
        rotationIndex: newRotationIndex,
      },
    };
  }
  const tests = wallKicks?.find(
    wk => wk.rotation === newRotationIndex && wk.direction === direction,
  ).tests;
  if (!tests) {
    return null;
  }
  for (let i = 0, len = tests.length; i < len; i++) {
    const [x, y] = tests[i];
    if (tetrominoCollision(state, rotation, x, y)) {
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
  let { tetrominoQueue, activeTetromino, holdTetromino, isHoldUsed } = state;
  if (isHoldUsed) {
    return null;
  }
  if (!holdTetromino) {
    holdTetromino = activeTetromino;
    ({ tetrominoQueue, activeTetromino } = shiftFromTetrominoQueue(
      tetrominoQueue,
    ));
  } else {
    const prevActiveTetromino = activeTetromino;
    activeTetromino = holdTetromino;
    holdTetromino = prevActiveTetromino;
  }
  return {
    tetrominoQueue,
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
  while (!tetrominoCollision(state, rotation, 0, offsetY)) {
    offsetY++;
  }
  offsetY--;
  return {
    ...activeTetromino,
    color: `${color}40`,
    y: y + offsetY,
  };
};

export const shiftFromTetrominoQueue = tetrominoQueue => ({
  activeTetromino: tetrominoQueue[0],
  tetrominoQueue: tetrominoQueue.slice(1),
});

export const createTetrominoQueue = tetrominoQueue => {
  if (tetrominoQueue.length > tetrominoes.length) {
    return tetrominoQueue;
  }
  const randomTetrominoes = [...tetrominoes].sort(() => Math.random() - 0.5);
  return [
    ...tetrominoQueue,
    ...randomTetrominoes.map(tetromino => {
      const { rotations } = tetromino;
      const defaults = {
        rotation: rotations[0],
        rotationIndex: 0,
        x: 3,
        y: 0,
      };
      return {
        ...tetromino,
        ...defaults,
        defaults,
      };
    }),
  ];
};