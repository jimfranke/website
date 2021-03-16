import { BOARD_COLS, BOARD_ROWS, NEXT_QUEUE_SIZE } from './constants.js';

let blockSize = 0;

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

    $mainCanvas.width = blockSize * BOARD_COLS;
    $mainCanvas.height = blockSize * BOARD_ROWS;
    $nextCanvas.width = blockSize * 4;
    $nextCanvas.height = blockSize * (NEXT_QUEUE_SIZE * 3 - 1);
    $holdCanvas.width = blockSize * 4;
    $holdCanvas.height = blockSize * 2;
  };
  window.addEventListener('resize', resize);
  resize();
};

export const getBlockSize = () => blockSize;

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

export const toggleBackgroundVideo = () => {
  const $bgVideo = document.querySelector('.background-video');
  if ($bgVideo.innerHTML) {
    $bgVideo.innerHTML = '';
    return;
  }
  $bgVideo.innerHTML = `
    <div style="
      width: 100%;
      height: 100vh;
      position: absolute;
      top: 0;
      left: 0;
      z-index: -1;
    "></div>
    <iframe
      src="https://www.youtube.com/embed/oTHy46l9-f4?controls=0&autoplay=1&start=13"
      allow="autoplay"
      frameborder="0"
      style="
        width: 100%;
        height: 100vh;
        position: absolute;
        top: 0;
        left: 0;
        z-index: -2;
      "
    ></iframe>
  `;
};
