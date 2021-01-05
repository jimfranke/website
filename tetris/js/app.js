import { BLOCK_SIZE, BOARD_COLS, BOARD_ROWS } from './constants.js';
import { handleGameInput, handleMenuInput } from './input.js';
import { createRenderer } from './render.js';
import { store } from './store.js';

const $app = document.getElementById('app');
const $menu = $app.querySelector('.menu');
const $game = $app.querySelector('.game');
const $paused = $game.querySelector('.view__paused');
const $controls = $game.querySelector('.controls');

const $statsScore = $game.querySelector('[data-stats=score]');
const $statsLines = $game.querySelector('[data-stats=lines]');
const $statsLevel = $game.querySelector('[data-stats=level]');

const $mainCanvas = $game.querySelector('.view__canvas-main');
const mainContext = $mainCanvas.getContext('2d');
const $holdCanvas = $game.querySelector('.view__canvas-hold');
const holdContext = $holdCanvas.getContext('2d');
const $nextCanvas = $game.querySelector('.view__canvas-next');
const nextContext = $nextCanvas.getContext('2d');

$mainCanvas.width = BLOCK_SIZE * BOARD_COLS;
$mainCanvas.height = BLOCK_SIZE * BOARD_ROWS;
$nextCanvas.width = BLOCK_SIZE * 4;
$nextCanvas.height = BLOCK_SIZE * 2;
$holdCanvas.width = BLOCK_SIZE * 4;
$holdCanvas.height = BLOCK_SIZE * 2;

const getSelectedLevel = () =>
  parseInt($menu.querySelector('.menu__input-level-select').value);

const render = createRenderer({
  store,
  mainContext,
  nextContext,
  holdContext,
  updateStats: ({ score, lines, level }) => {
    $statsScore.textContent = score;
    $statsLines.textContent = lines;
    $statsLevel.textContent = level;
  },
});

handleMenuInput({
  store,
  render,
  getSelectedLevel,
  $menu,
  $game,
});

handleGameInput({
  store,
  render,
  $paused,
  $controls,
});
