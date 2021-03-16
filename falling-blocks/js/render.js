import { mainContext, showGameOverMenu, updateStatsTexts } from './dom.js';
import {
  drawBoard,
  drawHoldTetromino,
  drawNextTetrominoQueue,
  drawTetromino,
} from './drawing.js';
import { timeNow } from './helpers.js';
import { createGhostTetromino } from './logic/core.js';
import { getGameState } from './logic/game.js';

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
  const state = getGameState(time ?? timeNow());
  const { isPlaying, isGameOver } = state;
  if (isGameOver) {
    showGameOverMenu();
  }
  if (isPlaying) {
    draw(state);
  }
  requestAnimationFrame(render);
};
