import { BOARD_COLS, BOARD_ROWS, NEXT_QUEUE_SIZE } from './constants.js';
import { getBlockSize, holdContext, mainContext, nextContext } from './dom.js';

const drawBlock = (context, x, y, color) => {
  if (!color) {
    return;
  }
  const blockSize = getBlockSize();
  context.fillStyle = color;
  context.fillRect(blockSize * x, blockSize * y, blockSize, blockSize);
};

export const drawTetromino = (context, tetromino) => {
  const { color, rotation } = tetromino;
  for (let y = 0, l = rotation.length; y < l; y++) {
    for (let x = 0; x < l; x++) {
      if (rotation[y][x]) {
        drawBlock(context, x + tetromino.x, y + tetromino.y, color);
      }
    }
  }
};

export const drawBoard = board => {
  const { width, height } = mainContext.canvas;
  mainContext.clearRect(0, 0, width, height);
  for (let y = 0; y < BOARD_ROWS; y++) {
    for (let x = 0; x < BOARD_COLS; x++) {
      drawBlock(mainContext, x, y, board[y][x]);
    }
  }
};

export const drawNextTetrominoQueue = nextTetrominoQueue => {
  const { width, height } = nextContext.canvas;
  nextContext.clearRect(0, 0, width, height);
  let spacingY = 0;
  for (let i = 0; i < NEXT_QUEUE_SIZE; i++) {
    const tetromino = nextTetrominoQueue[i];
    const prevTetromino = nextTetrominoQueue[i - 1];
    const { name } = tetromino;
    const x = name === 'O' ? -1 : 0;
    let y = i * 3 - (name === 'I' ? 1 : 0);
    if (prevTetromino?.name === 'I') {
      spacingY--;
    }
    y += spacingY;
    drawTetromino(nextContext, {
      ...tetromino,
      x,
      y,
    });
  }
};

export const drawHoldTetromino = tetromino => {
  const { width, height } = holdContext.canvas;
  holdContext.clearRect(0, 0, width, height);
  if (!tetromino) {
    return;
  }
  const { name } = tetromino;
  const x = name === 'I' ? 0 : 1;
  const y = x ? 0 : -1;
  drawTetromino(holdContext, {
    ...tetromino,
    x,
    y,
  });
};
