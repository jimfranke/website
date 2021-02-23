import {
  $gameOverMenu,
  $statsLevel,
  $statsLines,
  $statsScore,
  mainContext,
} from './dom.js';
import {
  drawBoard,
  drawHoldTetromino,
  drawNextTetrominoQueue,
  drawTetromino,
} from './drawing.js';
import { createGhostTetromino } from './logic/core.js';
import { getGameState } from './logic/game.js';

let rafId;

const draw = state => {
  const {
    board,
    nextTetrominoQueue,
    activeTetromino,
    holdTetromino,
    score,
    lines,
    level,
  } = state;
  drawBoard(board);
  drawTetromino(mainContext, createGhostTetromino(state));
  drawTetromino(mainContext, activeTetromino);
  drawNextTetrominoQueue(nextTetrominoQueue);
  drawHoldTetromino(holdTetromino);
  $statsLevel.textContent = level;
  $statsScore.textContent = score;
  $statsLines.textContent = lines;
};

export const render = (time = performance.now()) => {
  const state = getGameState(time);
  draw(state);
  const { isPlaying, isPaused, isGameOver } = state;
  if (!isPlaying || isPaused || isGameOver) {
    rafId = cancelAnimationFrame(rafId);
    if (isGameOver) {
      $gameOverMenu.style.display = null;
    }
    return;
  }
  rafId = requestAnimationFrame(render);
};
