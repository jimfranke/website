import { BLOCK_SIZE, BOARD_COLS, BOARD_ROWS, QUEUE_SIZE } from './constants.js';

const drawBlock = (context, x, y, color) => {
  if (!color) {
    return;
  }
  context.fillStyle = color;
  context.fillRect(BLOCK_SIZE * x, BLOCK_SIZE * y, BLOCK_SIZE, BLOCK_SIZE);
};

export const drawBoard = (context, board) => {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  for (let y = 0; y < BOARD_ROWS; y++) {
    for (let x = 0; x < BOARD_COLS; x++) {
      drawBlock(context, x, y, board[y][x]);
    }
  }
};

export const drawActiveTetromino = (context, tetromino) => {
  const { color, rotation } = tetromino;
  for (let y = 0, len = rotation.length; y < len; y++) {
    for (let x = 0; x < len; x++) {
      if (!rotation[y][x]) {
        continue;
      }
      drawBlock(context, x + tetromino.x, y + tetromino.y, color);
    }
  }
};

export const drawGhostTetromino = (context, ghostTetromino) => {
  const { color, rotation } = ghostTetromino ?? {};
  for (let y = 0, len = rotation?.length; y < len; y++) {
    for (let x = 0; x < len; x++) {
      if (!rotation[y][x]) {
        continue;
      }
      drawBlock(
        context,
        x + ghostTetromino.x,
        y + ghostTetromino.y,
        `${color}40`,
      );
    }
  }
};

export const drawTetrominoQueue = (context, tetrominoQueue) => {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  let spacingY = 0;
  for (let i = 0; i < QUEUE_SIZE; i++) {
    const tetromino = tetrominoQueue[i];
    if (!tetromino) {
      continue;
    }
    const prevTetromino = tetrominoQueue[i - 1];
    const { name, color, rotation } = tetromino;
    const offsetX = name === 'O' ? -1 : 0;
    let offsetY = i * 3;
    if (tetromino.name === 'I') {
      offsetY--;
    } else if (prevTetromino?.name === 'I') {
      spacingY--;
    }
    offsetY += spacingY;
    for (let y = 0, len = rotation.length; y < len; y++) {
      for (let x = 0; x < len; x++) {
        if (!rotation[y][x]) {
          continue;
        }
        drawBlock(context, x + offsetX, y + offsetY, color);
      }
    }
  }
};

export const drawHoldTetromino = (context, tetromino) => {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  if (!tetromino) {
    return;
  }
  const { name, color, rotation } = tetromino;
  const offsetX = name === 'I' ? 0 : 1;
  const offsetY = offsetX ? 0 : -1;
  for (let y = 0, len = rotation.length; y < len; y++) {
    for (let x = 0; x < len; x++) {
      if (!rotation[y][x]) {
        continue;
      }
      drawBlock(context, x + offsetX, y + offsetY, color);
    }
  }
};
