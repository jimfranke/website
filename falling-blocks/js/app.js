import {
  BLOCK_SIZE,
  BOARD_COLS,
  BOARD_ROWS,
  NEXT_QUEUE_SIZE,
} from './constants.js';
import { handleInput } from './input.js';
import { createRenderer } from './render.js';
import { store } from './store.js';

const $app = document.getElementById('app');
const $menu = $app.querySelector('.menu');
const $game = $app.querySelector('.game');
const $paused = $game.querySelector('.view__paused');

const $statsLevel = $game.querySelector('[data-stats=level]');
const $statsScore = $game.querySelector('[data-stats=score]');
const $statsLines = $game.querySelector('[data-stats=lines]');

const $mainCanvas = $game.querySelector('.view__canvas-main');
const mainContext = $mainCanvas.getContext('2d');
const $holdCanvas = $game.querySelector('.view__canvas-hold');
const holdContext = $holdCanvas.getContext('2d');
const $nextCanvas = $game.querySelector('.view__canvas-next');
const nextContext = $nextCanvas.getContext('2d');

$mainCanvas.width = BLOCK_SIZE * BOARD_COLS;
$mainCanvas.height = BLOCK_SIZE * BOARD_ROWS;
$nextCanvas.width = BLOCK_SIZE * 4;
$nextCanvas.height = BLOCK_SIZE * (NEXT_QUEUE_SIZE * 3 - 1);
$holdCanvas.width = BLOCK_SIZE * 4;
$holdCanvas.height = BLOCK_SIZE * 2;

const getSelectedLevel = () =>
  parseInt($menu.querySelector('.menu__input-level-select').value);

const render = createRenderer({
  store,
  mainContext,
  nextContext,
  holdContext,
  updateStats: ({ level, score, lines }) => {
    $statsLevel.textContent = level;
    $statsScore.textContent = score;
    $statsLines.textContent = lines;
  },
});

handleInput({
  store,
  render,
  getSelectedLevel,
  $menu,
  $game,
  $paused,
});
