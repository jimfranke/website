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

export const getSelectedLevel = () =>
  parseInt($mainMenu.querySelector('.main-menu__input-level-select').value);

export const updateStatsText = ({ score, lines, level }) => {
  $statsLevel.textContent = level;
  $statsScore.textContent = score;
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
