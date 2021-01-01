import { BOARD_COLS, BOARD_ROWS } from './constants.js';
import { createStore } from './helpers.js';

const state = {
  board: Array(BOARD_ROWS)
    .fill()
    .map(() => Array(BOARD_COLS).fill(null)),
  inputQueue: [],
  nextTetrominoQueue: [],
  activeTetromino: null,
  holdTetromino: null,
  lockTime: null,
  isHoldUsed: false,
  isPlaying: false,
  isPaused: false,
  isGameOver: false,
  score: 0,
  lines: 0,
  level: 0,
};

const store = createStore(state);
const { getState, setState } = store;

export const addToInputQueue = input => {
  const { inputQueue } = getState();
  return setState({
    inputQueue: [...inputQueue, input],
  });
};

export { store };
