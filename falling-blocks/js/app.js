import { tetrominoes } from './tetrominoes.js';

const BOARD_COLS = 10;
const BOARD_ROWS = 20;
const BLOCK_SIZE = 28;
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
let isHoldUsed = false;
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
        return rotateActiveTetromino(-1);
      case 'KeyX':
        return rotateActiveTetromino();
      case 'KeyC':
        return holdActiveTetromino();
      case 'ArrowLeft':
        return moveActiveTetrominoLeft();
      case 'ArrowRight':
        return moveActiveTetrominoRight();
      case 'ArrowUp':
        return moveActiveTetrominoDown(true);
      case 'ArrowDown':
        return moveActiveTetrominoDown();
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

const rotateActiveTetromino = (direction = 1) => {
  const { rotations, rotationIndex } = activeTetromino;
  const { length } = rotations;
  if (length < 2) {
    return;
  }
  const newRotationIndex =
    direction < 0
      ? (rotationIndex > 0 ? rotationIndex : length) - 1
      : (rotationIndex + 1) % length;
  const rotation = rotations[newRotationIndex];
  if (!tetrominoCollision(rotation, 0, 0)) {
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
    if (!tetrominoCollision(rotation, x, y)) {
      activeTetromino.rotationIndex = newRotationIndex;
      activeTetromino.x += x;
      activeTetromino.y += y;
      break;
    }
  }
};

const holdActiveTetromino = () => {
  if (isHoldUsed) {
    return;
  }
  if (!holdTetromino) {
    holdTetromino = activeTetromino;
    setActiveTetromino();
  } else {
    const tempTetromino = activeTetromino;
    activeTetromino = holdTetromino;
    holdTetromino = tempTetromino;
  }
  holdTetromino.reset();
  isHoldUsed = true;
};

const moveActiveTetrominoLeft = () => {
  if (!tetrominoCollision(activeTetromino.rotation, -1, 0)) {
    activeTetromino.x--;
  }
};

const moveActiveTetrominoRight = () => {
  if (!tetrominoCollision(activeTetromino.rotation, 1, 0)) {
    activeTetromino.x++;
  }
};

const moveActiveTetrominoDown = isHard => {
  if (!tetrominoCollision(activeTetromino.rotation, 0, 1)) {
    activeTetromino.y++;
    if (isHard) {
      moveActiveTetrominoDown(true);
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
      const rotationIndex = 0;
      const x = 3;
      const y = 0;
      return {
        ...tetromino,
        get rotation() {
          return this.rotations[this.rotationIndex];
        },
        reset() {
          Object.assign(this, { rotationIndex, x, y });
        },
        rotationIndex,
        x,
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
  isHoldUsed = false;
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
  offsetY--;
  for (let y = 0, len = rotation.length; y < len; y++) {
    for (let x = 0; x < len; x++) {
      if (!rotation[y][x]) {
        continue;
      }
      drawBlock(
        mainContext,
        x + activeTetromino.x,
        y + activeTetromino.y + offsetY,
        `${color}30`,
      );
    }
  }
};

const drawTetrominoQueue = () => {
  queueContext.clearRect(0, 0, $queueCanvas.width, $queueCanvas.height);
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
        drawBlock(queueContext, x + offsetX, y + offsetY, color);
      }
    }
  }
};

const drawHoldTetromino = () => {
  holdContext.clearRect(0, 0, $holdCanvas.width, $holdCanvas.height);
  if (!holdTetromino) {
    return;
  }
  const { name, color, rotation } = holdTetromino;
  const offsetX = name === 'I' ? 0 : 1;
  const offsetY = offsetX ? 0 : -1;
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
  }
  drawBoard();
  drawGhostTetromino();
  drawActiveTetromino();
  drawTetrominoQueue();
  drawHoldTetromino();
  if (time - dropTime > DROP_SPEED) {
    moveActiveTetrominoDown();
    dropTime = time;
  }
  if (!isPlaying || isGameOver) {
    rafId = cancelAnimationFrame(rafId);
    return;
  }
  rafId = requestAnimationFrame(render);
};

init();
