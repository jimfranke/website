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
const $mainMenu = $app.querySelector('.main-menu');
const $game = $app.querySelector('.game');
const $pauseMenu = $game.querySelector('.view__pause-menu');
const $gameOverMenu = $game.querySelector('.view__game-over-menu');

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
  parseInt($mainMenu.querySelector('.main-menu__input-level-select').value);

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
  $gameOverMenu,
});

handleInput({
  store,
  render,
  getSelectedLevel,
  $mainMenu,
  $game,
  $pauseMenu,
  $gameOverMenu,
});
