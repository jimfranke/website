import { BOARD_COLS, BOARD_ROWS } from './constants.js';
import { tetrominoes } from './tetrominoes.js';

export const moveActiveTetrominoLeft = store => {
  const { activeTetromino } = store.getState();
  if (!tetrominoCollision(store, activeTetromino.rotation, -1, 0)) {
    activeTetromino.x--;
  }
};

export const moveActiveTetrominoRight = store => {
  const { activeTetromino } = store.getState();
  if (!tetrominoCollision(store, activeTetromino.rotation, 1, 0)) {
    activeTetromino.x++;
  }
};

export const moveActiveTetrominoDown = (store, isHard) => {
  const { activeTetromino } = store.getState();
  if (!tetrominoCollision(store, activeTetromino.rotation, 0, 1)) {
    activeTetromino.y++;
    if (isHard) {
      moveActiveTetrominoDown(store, true);
    }
    return;
  }
  lockTetromino(store);
};

export const rotateActiveTetromino = (store, direction = 1) => {
  const { activeTetromino } = store.getState();
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
  if (!tetrominoCollision(store, rotation, 0, 0)) {
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
    if (tetrominoCollision(store, rotation, x, y)) {
      continue;
    }
    activeTetromino.rotationIndex = newRotationIndex;
    activeTetromino.x += x;
    activeTetromino.y += y;
    break;
  }
};

export const holdActiveTetromino = store => {
  let state = store.getState();
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
  store.setState({
    activeTetromino,
    holdTetromino,
  });
  holdTetromino.reset();
  store.setState({
    isHoldUsed: true,
  });
};

export const tetrominoCollision = (store, rotation, offsetX, offsetY) => {
  const { board, activeTetromino } = store.getState();
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

export const createTetrominoes = tetrominoQueue => {
  if (tetrominoQueue.length > tetrominoes.length) {
    return;
  }
  const randomTetrominoes = [...tetrominoes].sort(() => Math.random() - 0.5);
  tetrominoQueue.push(
    ...randomTetrominoes.map(tetromino => {
      const rotationIndex = 0;
      const x = 3;
      const y = 0;
      const obj = {
        ...tetromino,
        get rotation() {
          return obj.rotations[obj.rotationIndex];
        },
        reset: () => {
          Object.assign(obj, { rotationIndex, x, y });
        },
        rotationIndex,
        x,
        y,
      };
      return obj;
    }),
  );
};

export const lockTetromino = store => {
  const { board, activeTetromino } = store.getState();
  const { color, rotation } = activeTetromino;
  for (let y = 0, len = rotation.length; y < len; y++) {
    for (let x = 0; x < len; x++) {
      if (!rotation[y][x]) {
        continue;
      }
      if (activeTetromino.y + y < 1) {
        store.setState({
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
    let { linesCleared } = store.getState();
    store.setState({
      linesCleared: linesCleared + 1,
    });
  }
  activeTetromino.isLocked = true;
  store.setState({
    isHoldUsed: false,
  });
};
