import {
  BLOCK_SIZE,
  BOARD_COLS,
  BOARD_ROWS,
  NEXT_QUEUE_SIZE,
} from './constants.js';

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

export const drawTetromino = (context, tetromino) => {
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

export const drawNextTetrominoQueue = (context, nextTetrominoQueue) => {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  let spacingY = 0;
  for (let i = 0; i < NEXT_QUEUE_SIZE; i++) {
    const tetromino = nextTetrominoQueue[i];
    if (!tetromino) {
      continue;
    }
    const prevTetromino = nextTetrominoQueue[i - 1];
    const { name } = tetromino;
    const x = name === 'O' ? -1 : 0;
    let y = i * 3 - (name === 'I' ? 2 : 1);
    if (prevTetromino?.name === 'I') {
      spacingY--;
    }
    y += spacingY;
    drawTetromino(context, {
      ...tetromino,
      x,
      y,
    });
  }
};

export const drawHoldTetromino = (context, tetromino) => {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  if (!tetromino) {
    return;
  }
  const { name } = tetromino;
  const x = name === 'I' ? 0 : 1;
  const y = x ? -1 : -2;
  drawTetromino(context, {
    ...tetromino,
    x,
    y,
  });
};
