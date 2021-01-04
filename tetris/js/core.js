import {
  BOARD_COLS,
  BOARD_ROWS,
  POINTS_DOUBLE,
  POINTS_SINGLE,
  POINTS_TETRIS,
  POINTS_TRIPLE,
  TETROMINOES,
} from './constants.js';

const createTetromino = () => {
  const index = Math.floor(Math.random() * TETROMINOES.length);
  const tetromino = TETROMINOES[index];
  const { name, rotations } = tetromino;
  const y = name === 'I' ? -2 : -1;
  return {
    ...tetromino,
    rotation: rotations[0],
    rotationIndex: 0,
    x: 3,
    y,
  };
};

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
    score += points * level;
    lines += clears;
    if (lines >= level * 10 + 10 || lines >= Math.max(100, level * 10 - 50)) {
      level++;
    }
  }
  return { board, score, lines, level };
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
    activeTetromino: {
      ...activeTetromino,
      isLocked: true,
    },
    isGameOver,
  };
};

export const moveActiveTetrominoLeft = state => {
  let { activeTetromino } = state;
  const { rotation, x } = activeTetromino;
  if (tetrominoCollision(state, rotation, -1, 0)) {
    return null;
  }
  return {
    activeTetromino: {
      ...activeTetromino,
      x: x - 1,
    },
    lockTime: null,
  };
};

export const moveActiveTetrominoRight = state => {
  let { activeTetromino } = state;
  const { rotation, x } = activeTetromino;
  if (tetrominoCollision(state, rotation, 1, 0)) {
    return null;
  }
  return {
    activeTetromino: {
      ...activeTetromino,
      x: x + 1,
    },
    lockTime: null,
  };
};

export const moveActiveTetrominoDown = state => {
  let { activeTetromino } = state;
  const { rotation, y } = activeTetromino;
  if (tetrominoCollision(state, rotation, 0, 1)) {
    return lockActiveTetromino(state);
  }
  return {
    activeTetromino: {
      ...activeTetromino,
      y: y + 1,
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
  if (tetrominoCollision(state, rotation, 0, 0)) {
    return null;
  }
  return {
    activeTetromino: {
      ...activeTetromino,
      rotation: rotations[newRotationIndex],
      rotationIndex: newRotationIndex,
    },
    lockTime: null,
  };
};

export const useNextTetromino = ({ nextTetromino, activeTetromino }) => {
  activeTetromino = nextTetromino ?? createTetromino();
  nextTetromino = createTetromino();
  if (nextTetromino.name === activeTetromino.name) {
    nextTetromino = createTetromino();
  }
  return { nextTetromino, activeTetromino };
};
