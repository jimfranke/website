import { BLOCK_SIZE, BOARD_COLS, BOARD_ROWS, NEXT_SIZE } from './constants.js';
import { handleGameInput, handleMenuInput } from './input.js';
import { createRenderer } from './render.js';
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
const $nextCanvas = $game.querySelector('.view__canvas-next');
const nextContext = $nextCanvas.getContext('2d');

$mainCanvas.width = BLOCK_SIZE * BOARD_COLS;
$mainCanvas.height = BLOCK_SIZE * BOARD_ROWS;
$nextCanvas.width = BLOCK_SIZE * 4;
$nextCanvas.height = BLOCK_SIZE * (NEXT_SIZE * 3 - 1);
$holdCanvas.width = BLOCK_SIZE * 4;
$holdCanvas.height = BLOCK_SIZE * 2;

const store = getStore();

const render = createRenderer({
  store,
  mainContext,
  nextContext,
  holdContext,
  updateStats: ({ score, lines, level }) => {
    $score.textContent = score;
    $lines.textContent = lines;
    $level.textContent = level;
  },
});

handleMenuInput({
  store,
  render,
  $menu,
  $game,
});

handleGameInput({
  store,
  render,
  $paused,
  $controls,
});
