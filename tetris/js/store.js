import { BOARD_COLS, BOARD_ROWS } from './constants.js';

let globalState = {
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

const getState = () => globalState;

const setState = state => {
  globalState = { ...globalState, ...state };
  return globalState;
};

const enqueueInput = input => {
  const { inputQueue } = getState();
  return setState({
    inputQueue: [...inputQueue, input],
  });
};

export const store = {
  getState,
  setState,
  enqueueInput,
};
