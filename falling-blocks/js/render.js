import { mainContext, showGameOverMenu, updateStatsTexts } from './dom.js';
import {
  drawBoard,
  drawHoldTetromino,
  drawNextTetrominoQueue,
  drawTetromino,
} from './drawing.js';
import { createGhostTetromino } from './logic/core.js';
import { getGameState } from './logic/game.js';

let rafId = 0;

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
  drawTetromino(mainContext, activeTetromino);
  drawTetromino(mainContext, createGhostTetromino(state));
  drawNextTetrominoQueue(nextTetrominoQueue);
  drawHoldTetromino(holdTetromino);
  updateStatsTexts({ score, lines, level });
};

export const render = time => {
  const state = getGameState(time ?? performance.now());
  draw(state);
  const { isPaused, isGameOver } = state;
  if (isPaused || isGameOver) {
    rafId = cancelAnimationFrame(rafId);
    if (isGameOver) {
      showGameOverMenu();
    }
    return;
  }
  rafId = requestAnimationFrame(render);
};
