import { BOARD_COLS, BOARD_ROWS } from './constants.js';
import { createStore } from './helpers.js';

export const getStore = () =>
  createStore({
    board: Array(BOARD_ROWS)
      .fill()
      .map(() => Array(BOARD_COLS).fill(null)),
    tetrominoQueue: [],
    activeTetromino: null,
    holdTetromino: null,
    isPlaying: false,
    isPaused: false,
    isGameOver: false,
    isHoldUsed: false,
    score: 0,
    lines: 0,
    level: 0,
  });
