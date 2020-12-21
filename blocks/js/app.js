import { tetrominoes } from './tetrominoes.js';

const BOARD_COLS = 10;
const BOARD_ROWS = 20;
const BLOCK_SIZE = 25;
const DROP_SPEED = 800;
const QUEUE_SIZE = 6;

const $app = document.getElementById('app');
const $lines = $app.querySelector('[data-lines]');

const $mainCanvas = $app.querySelector('.canvas-main');
const mainContext = $mainCanvas.getContext('2d');

const $holdCanvas = $app.querySelector('.canvas-hold');
const holdContext = $holdCanvas.getContext('2d');

const $queueCanvas = app.querySelector('.canvas-queue');
const queueContext = $queueCanvas.getContext('2d');

const board = Array(BOARD_ROWS)
  .fill()
  .map(() => Array(BOARD_COLS).fill(null));

let activeTetromino;
let holdTetromino;
let tetrominoQueue = [];
let isPlaying = false;
let isGameOver = false;
let lines = 0;

let dropTime;
let rafId;

const init = () => {
  $mainCanvas.width = BLOCK_SIZE * BOARD_COLS;
  $mainCanvas.height = BLOCK_SIZE * BOARD_ROWS;
  $queueCanvas.width = BLOCK_SIZE * 4;
  $queueCanvas.height = BLOCK_SIZE * (QUEUE_SIZE * 3 - 1);
  $holdCanvas.width = BLOCK_SIZE * 4;
  $holdCanvas.height = BLOCK_SIZE * 2;
  handleInput();
  render();
  $app.style.display = null;
};

const handleInput = () => {
  document.addEventListener('keydown', e => {
    if (isGameOver) {
      return;
    }
    if (e.code === 'Space') {
      startPauseGame();
    }
    if (!isPlaying) {
      return;
    }
    switch (e.code) {
      case 'KeyZ':
        return rotateTetromino(true);
      case 'KeyX':
        return rotateTetromino();
      case 'ArrowLeft':
        return moveTetrominoLeft();
      case 'ArrowRight':
        return moveTetrominoRight();
      case 'ArrowUp':
        moveTetrominoDown(true);
        break;
      case 'ArrowDown':
        moveTetrominoDown();
        break;
    }
  });
};

const startPauseGame = () => {
  if ((isPlaying = !isPlaying)) {
    render();
  }
};

const gameOver = () => {
  isGameOver = true;
  isPlaying = false;
};

const rotateTetromino = isLeft => {
  const { rotations, activeIndex } = activeTetromino;
  const { length } = rotations;
  if (length < 2) {
    return;
  }
  const index = isLeft
    ? (activeIndex > 0 ? activeIndex : length) - 1
    : (activeIndex + 1) % length;
  const rotation = rotations[index];
  if (!tetrominoCollision(rotation, 0, 0)) {
    activeTetromino.activeIndex = index;
  }
};

const moveTetrominoLeft = () => {
  if (!tetrominoCollision(activeTetromino.rotation, -1, 0)) {
    activeTetromino.x--;
  }
};

const moveTetrominoRight = () => {
  if (!tetrominoCollision(activeTetromino.rotation, 1, 0)) {
    activeTetromino.x++;
  }
};

const moveTetrominoDown = isHard => {
  if (!tetrominoCollision(activeTetromino.rotation, 0, 1)) {
    activeTetromino.y++;
    if (isHard) {
      moveTetrominoDown(true);
    }
    return;
  }
  lockTetromino();
};

const setActiveTetromino = () => {
  activeTetromino = tetrominoQueue.shift();
};

const createTetrominoes = () => {
  if (tetrominoQueue.length > tetrominoes.length) {
    return;
  }
  const randomTetrominoes = [...tetrominoes].sort(() => Math.random() - 0.5);
  tetrominoQueue.push(
    ...randomTetrominoes.map(tetromino => {
      const { name } = tetromino;
      const y = name === 'I' || name === 'O' ? -1 : 0;
      return {
        ...tetromino,
        get rotation() {
          return this.rotations[this.activeIndex];
        },
        activeIndex: 0,
        x: 3,
        y,
      };
    }),
  );
};

const tetrominoCollision = (rotation, offsetX, offsetY) => {
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

const lockTetromino = () => {
  const { color, rotation } = activeTetromino;
  for (let y = 0, len = rotation.length; y < len; y++) {
    for (let x = 0; x < len; x++) {
      if (!rotation[y][x]) {
        continue;
      }
      if (activeTetromino.y + y < 1) {
        gameOver();
        break;
      }
      board[activeTetromino.y + y][activeTetromino.x + x] = color;
    }
  }
  clearFullRows();
  activeTetromino.isLocked = true;
};

const clearFullRows = () => {
  for (let y = BOARD_ROWS - 1; y >= 0; y--) {
    if (board[y].some(x => !x)) {
      continue;
    }
    board.splice(y++, 1);
    board.unshift(Array(BOARD_COLS).fill(null));
    lines++;
  }
};

const drawBlock = (context, x, y, color) => {
  if (!color) {
    return;
  }
  context.fillStyle = color;
  context.fillRect(BLOCK_SIZE * x, BLOCK_SIZE * y, BLOCK_SIZE, BLOCK_SIZE);
};

const drawBoard = () => {
  mainContext.clearRect(0, 0, $mainCanvas.width, $mainCanvas.height);
  for (let y = 0; y < BOARD_ROWS; y++) {
    for (let x = 0; x < BOARD_COLS; x++) {
      drawBlock(mainContext, x, y, board[y][x]);
    }
  }
};

const drawActiveTetromino = () => {
  const { color, rotation } = activeTetromino;
  for (let y = 0, len = rotation.length; y < len; y++) {
    for (let x = 0; x < len; x++) {
      if (!rotation[y][x]) {
        continue;
      }
      drawBlock(
        mainContext,
        x + activeTetromino.x,
        y + activeTetromino.y,
        color,
      );
    }
  }
};

const drawGhostTetromino = () => {
  const { color, rotation } = activeTetromino;
  let offsetY = 1;
  while (!tetrominoCollision(rotation, 0, offsetY)) {
    offsetY++;
  }
  for (let y = 0, len = rotation.length; y < len; y++) {
    for (let x = 0; x < len; x++) {
      if (!rotation[y][x]) {
        continue;
      }
      drawBlock(
        mainContext,
        x + activeTetromino.x,
        y + activeTetromino.y + (offsetY - 1),
        `${color}30`,
      );
    }
  }
};

const drawTetrominoQueue = () => {
  queueContext.clearRect(0, 0, $queueCanvas.width, $queueCanvas.height);
  let spacingY = 0;
  for (let i = 0; i < QUEUE_SIZE; i++) {
    let tetromino = tetrominoQueue[i];
    const { name, color, rotation } = tetromino;
    if (tetrominoQueue[i - 1]?.name === 'I') {
      spacingY--;
    }
    const offsetX = name === 'O' ? -1 : 0;
    const offsetY = tetromino.y + spacingY + i * 3;
    for (let y = 0, len = rotation.length; y < len; y++) {
      for (let x = 0; x < len; x++) {
        if (!rotation[y][x]) {
          continue;
        }
        drawBlock(queueContext, x + offsetX, y + offsetY, color);
      }
    }
  }
};

const drawHoldTetromino = () => {
  holdContext.clearRect(0, 0, $holdCanvas.width, $holdCanvas.height);
  const { name, color, rotation, y } = tetrominoQueue[0];
  const offsetX = name === 'I' ? 0 : 1;
  const offsetY = y;
  for (let y = 0, len = rotation.length; y < len; y++) {
    for (let x = 0; x < len; x++) {
      if (!rotation[y][x]) {
        continue;
      }
      drawBlock(holdContext, x + offsetX, y + offsetY, color);
    }
  }
};

const render = () => {
  const time = Date.now();
  dropTime ??= time;
  $lines.textContent = lines;
  if (!activeTetromino || activeTetromino.isLocked) {
    createTetrominoes();
    setActiveTetromino();
    drawTetrominoQueue();
  }
  drawBoard();
  drawGhostTetromino();
  drawActiveTetromino();
  drawHoldTetromino();
  if (time - dropTime > DROP_SPEED) {
    moveTetrominoDown();
    dropTime = time;
  }
  if (!isPlaying || isGameOver) {
    rafId = cancelAnimationFrame(rafId);
    return;
  }
  rafId = requestAnimationFrame(render);
};

init();
