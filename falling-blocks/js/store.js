import { BOARD_COLS, BOARD_ROWS } from './constants.js';
import { clone } from './helpers.js';

const initialState = {
  board: Array(BOARD_ROWS)
    .fill()
    .map(() => Array(BOARD_COLS).fill(null)),
  inputQueue: [],
  nextTetrominoQueue: [],
  activeTetromino: null,
  holdTetromino: null,
  isHoldUsed: false,
  isPlaying: false,
  isPaused: false,
  isGameOver: false,
  level: 1,
  score: 0,
  lines: 0,
};

let globalState = clone(initialState);

const getState = () => globalState;

const setState = state => {
  globalState = { ...globalState, ...state };
  return globalState;
};

const resetState = () => setState(clone(initialState));

const enqueueInput = input => {
  const { inputQueue } = getState();
  return setState({
    inputQueue: [...inputQueue, input],
  });
};

export const store = {
  getState,
  setState,
  resetState,
  enqueueInput,
};
