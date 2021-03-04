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
  isHoldUsed: false,
  isPaused: false,
  isGameOver: false,
  delay: 0,
  level: 1,
  score: 0,
  lines: 0,
};

let globalState = deepClone(initialState);

const getState = () => globalState;
const setState = state => (globalState = { ...globalState, ...state });

const resetState = () => setState(deepClone(initialState));

export const store = {
  getState,
  setState,
  resetState,
};
