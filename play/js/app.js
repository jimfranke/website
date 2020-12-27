import { BLOCK_SIZE, BOARD_COLS, BOARD_ROWS, QUEUE_SIZE } from './constants.js';
import {
  drawBoard,
  drawHoldTetromino,
  drawTetromino,
  drawTetrominoQueue,
} from './drawing.js';
import {
  createGhostTetromino,
  createTetrominoQueue,
  moveActiveTetrominoDown,
  shiftFromTetrominoQueue,
} from './engine.js';
import { handleInput } from './input.js';
import { getStore } from './store.js';

const $app = document.getElementById('app');
const $menu = $app.querySelector('.menu');
const $game = $app.querySelector('.game');
const $paused = $game.querySelector('.view__paused');
const $controls = $game.querySelector('.controls');

const $score = $game.querySelector('[data-score]');
const $lines = $game.querySelector('[data-lines]');
const $level = $game.querySelector('[data-level]');

const $mainCanvas = $game.querySelector('.view__canvas-main');
const mainContext = $mainCanvas.getContext('2d');
const $holdCanvas = $game.querySelector('.view__canvas-hold');
const holdContext = $holdCanvas.getContext('2d');
const $queueCanvas = $game.querySelector('.view__canvas-queue');
const queueContext = $queueCanvas.getContext('2d');

$mainCanvas.width = BLOCK_SIZE * BOARD_COLS;
$mainCanvas.height = BLOCK_SIZE * BOARD_ROWS;
$queueCanvas.width = BLOCK_SIZE * 4;
$queueCanvas.height = BLOCK_SIZE * (QUEUE_SIZE * 3 - 1);
$holdCanvas.width = BLOCK_SIZE * 4;
$holdCanvas.height = BLOCK_SIZE * 2;

const store = getStore();
const { getState, setState } = store;

let dropTime;
let rafId;

const render = () => {
  const time = Date.now();
  dropTime ??= time;
  let state = getState();
  let {
    board,
    tetrominoQueue,
    activeTetromino,
    holdTetromino,
    score,
    lines,
    level,
  } = state;
  const dropSpeed = 750;
  $score.textContent = score;
  $lines.textContent = lines;
  $level.textContent = level;
  if (!activeTetromino || activeTetromino.isLocked) {
    tetrominoQueue = createTetrominoQueue(tetrominoQueue);
    ({ tetrominoQueue, activeTetromino } = shiftFromTetrominoQueue(
      tetrominoQueue,
    ));
    state = setState({ tetrominoQueue, activeTetromino });
  }
  drawBoard(mainContext, board);
  drawTetromino(mainContext, createGhostTetromino(state));
  drawTetromino(mainContext, activeTetromino);
  drawTetrominoQueue(queueContext, tetrominoQueue);
  drawHoldTetromino(holdContext, holdTetromino);
  if (time - dropTime > dropSpeed) {
    state = setState(moveActiveTetrominoDown(state));
    dropTime = time;
  }
  const { isPaused, isGameOver } = state;
  if (isPaused || isGameOver) {
    rafId = cancelAnimationFrame(rafId);
    return;
  }
  rafId = requestAnimationFrame(render);
};

handleInput({
  $app,
  $menu,
  $game,
  $paused,
  $controls,
  store,
  render,
});
