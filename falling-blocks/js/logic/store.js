import { BOARD_COLS, BOARD_ROWS } from '../constants.js';
import { deepClone } from '../helpers.js';

const initialState = {
  board: Array(BOARD_ROWS)
    .fill()
    .map(() => Array(BOARD_COLS).fill(null)),
  inputKeys: {},
  nextTetrominoQueue: [],
  activeTetromino: null,
  holdTetromino: null,
  dropTime: 0,
  lockDelayTime: 0,
  moveCount: 0,
  isHoldUsed: false,
  isFixedLevel: false,
  isPlaying: false,
  isPaused: false,
  isGameOver: false,
  level: 1,
  score: 0,
  lines: 0,
};

let globalState = deepClone(initialState);

const getState = () => globalState;
const setState = state => {
  globalState = { ...globalState, ...state };
  return globalState;
};

const resetState = () => setState(deepClone(initialState));

export const store = {
  getState,
  setState,
  resetState,
};
