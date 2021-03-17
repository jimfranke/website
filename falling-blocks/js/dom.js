import { BOARD_COLS, BOARD_ROWS, NEXT_QUEUE_SIZE } from './constants.js';

let blockSize = 0;
let blockSizeSmall = 0;

export const $app = document.getElementById('app');
export const $mainMenu = $app.querySelector('.main-menu');
export const $game = $app.querySelector('.game');
export const $pauseMenu = $game.querySelector('.view__pause-menu');
export const $gameOverMenu = $game.querySelector('.view__game-over-menu');

export const $statsLevel = $game.querySelector('[data-stats=level]');
export const $statsScore = $game.querySelector('[data-stats=score]');
export const $statsLines = $game.querySelector('[data-stats=lines]');

export const $mainCanvas = $game.querySelector('.view__canvas-main');
export const mainContext = $mainCanvas.getContext('2d');

export const $holdCanvas = $game.querySelector('.view__canvas-hold');
export const holdContext = $holdCanvas.getContext('2d');

export const $nextCanvas = $game.querySelector('.view__canvas-next');
export const nextContext = $nextCanvas.getContext('2d');

export const handleResize = () => {
  const resize = () => {
    const aspectRatio = BOARD_COLS / BOARD_ROWS;
    const base = Math.min(window.innerWidth / aspectRatio, window.innerHeight);

    blockSize = Math.floor(base / 1.5 / BOARD_ROWS);
    blockSizeSmall = Math.floor(blockSize * 0.6);

    $mainCanvas.width = blockSize * BOARD_COLS;
    $mainCanvas.height = blockSize * BOARD_ROWS;
    $nextCanvas.width = blockSizeSmall * 4;
    $nextCanvas.height = blockSizeSmall * (NEXT_QUEUE_SIZE * 3 - 1);
    $holdCanvas.width = blockSizeSmall * 4;
    $holdCanvas.height = blockSizeSmall * 2;
  };
  window.addEventListener('resize', resize);
  resize();
};

export const getBlockSize = context =>
  context === mainContext ? blockSize : blockSizeSmall;

export const getSelectedLevel = () =>
  parseInt($mainMenu.querySelector('.main__menu-input-select--level').value);

export const getIsFixedLevel = () =>
  $mainMenu.querySelector('.main__menu-input-select--mode').value ===
  'practice';

export const updateStatsTexts = ({ score, lines, level }) => {
  $statsLevel.textContent = level;
  $statsScore.textContent = score.toLocaleString('nl-NL');
  $statsLines.textContent = lines;
};

export const showGame = () => {
  $mainMenu.style.display = 'none';
  $game.style.display = null;
};

export const hideGame = () => {
  $mainMenu.style.display = null;
  $game.style.display = 'none';
  $pauseMenu.style.display = 'none';
  $gameOverMenu.style.display = 'none';
};

export const showPauseMenu = () => {
  $pauseMenu.style.display = null;
};

export const hidePauseMenu = () => {
  $pauseMenu.style.display = 'none';
};

export const showGameOverMenu = () => {
  $gameOverMenu.style.display = null;
};
