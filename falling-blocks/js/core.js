import { BOARD_COLS, BOARD_ROWS } from './constants.js';
import { tetrominoes } from './tetrominoes.js';

export const moveActiveTetrominoLeft = state => {
  const { activeTetromino } = state;
  if (!tetrominoCollision(state, activeTetromino.rotation, -1, 0)) {
    activeTetromino.x--;
  }
};

export const moveActiveTetrominoRight = state => {
  const { activeTetromino } = state;
  if (!tetrominoCollision(state, activeTetromino.rotation, 1, 0)) {
    activeTetromino.x++;
  }
};

export const moveActiveTetrominoDown = (state, isHard) => {
  const { activeTetromino } = state;
  if (!tetrominoCollision(state, activeTetromino.rotation, 0, 1)) {
    activeTetromino.y++;
    if (isHard) {
      moveActiveTetrominoDown(state, true);
    }
    return;
  }
  lockActiveTetromino(state);
};

export const rotateActiveTetromino = (state, direction = 1) => {
  const { activeTetromino } = state;
  const { rotations, rotationIndex } = activeTetromino;
  const { length } = rotations;
  if (length < 2) {
    return;
  }
  const newRotationIndex =
    direction > 0
      ? (rotationIndex + 1) % length
      : (rotationIndex > 0 ? rotationIndex : length) - 1;
  const rotation = rotations[newRotationIndex];
  if (!tetrominoCollision(state, rotation, 0, 0)) {
    activeTetromino.rotationIndex = newRotationIndex;
    return;
  }
  const wallKicks = activeTetromino.wallKicks?.find(
    wk => wk.rotation === newRotationIndex && wk.direction === direction,
  );
  if (!wallKicks) {
    return;
  }
  const { tests } = wallKicks;
  for (let i = 0, len = tests.length; i < len; i++) {
    const [x, y] = tests[i];
    if (tetrominoCollision(state, rotation, x, y)) {
      continue;
    }
    activeTetromino.rotationIndex = newRotationIndex;
    activeTetromino.x = activeTetromino.x + x;
    activeTetromino.y = activeTetromino.y + y;
    break;
  }
};

export const holdActiveTetromino = state => {
  let { tetrominoQueue, activeTetromino, holdTetromino, isHoldUsed } = state;
  if (isHoldUsed) {
    return;
  }
  if (!holdTetromino) {
    holdTetromino = activeTetromino;
    activeTetromino = tetrominoQueue.shift();
  } else {
    const prevActiveTetromino = activeTetromino;
    activeTetromino = holdTetromino;
    holdTetromino = prevActiveTetromino;
  }
  state.update({
    activeTetromino,
    holdTetromino,
  });
  holdTetromino.reset();
  state.update({
    isHoldUsed: true,
  });
};

export const createGhostTetromino = state => {
  const { activeTetromino } = state;
  const { rotation, y } = activeTetromino;
  let offsetY = 1;
  while (!tetrominoCollision(state, rotation, 0, offsetY)) {
    offsetY++;
  }
  return {
    ...activeTetromino,
    y: y + (offsetY - 1),
  };
};

export const tetrominoCollision = (state, rotation, offsetX, offsetY) => {
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

export const fillTetrominoQueue = tetrominoQueue => {
  if (tetrominoQueue.length > tetrominoes.length) {
    return;
  }
  const randomTetrominoes = [...tetrominoes].sort(() => Math.random() - 0.5);
  tetrominoQueue.push(
    ...randomTetrominoes.map(randomTetromino => {
      const rotationIndex = 0;
      const x = 3;
      const y = 0;
      const tetromino = {
        ...randomTetromino,
        get rotation() {
          return tetromino.rotations[tetromino.rotationIndex];
        },
        reset: () => {
          Object.assign(tetromino, { rotationIndex, x, y });
        },
        rotationIndex,
        x,
        y,
      };
      return tetromino;
    }),
  );
};

export const lockActiveTetromino = state => {
  const { board, activeTetromino } = state;
  const { color, rotation } = activeTetromino;
  for (let y = 0, len = rotation.length; y < len; y++) {
    for (let x = 0; x < len; x++) {
      if (!rotation[y][x]) {
        continue;
      }
      if (activeTetromino.y + y < 1) {
        state.update({
          isPlaying: false,
          isGameOver: true,
        });
        break;
      }
      board[activeTetromino.y + y][activeTetromino.x + x] = color;
    }
  }
  for (let y = BOARD_ROWS - 1; y >= 0; y--) {
    if (board[y].some(x => !x)) {
      continue;
    }
    board.splice(y++, 1);
    board.unshift(Array(BOARD_COLS).fill(null));
    let { linesCleared } = state;
    state.update({
      linesCleared: linesCleared + 1,
    });
  }
  activeTetromino.isLocked = true;
  state.update({
    isHoldUsed: false,
  });
};
