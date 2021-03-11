import {
  AUTO_REPEAT_RATE,
  DELAYED_AUTO_SHIFT,
  SOFT_DROP_RATE,
} from '../constants.js';
import { timeNow } from '../helpers.js';
import {
  holdActiveTetromino,
  moveActiveTetrominoDown,
  moveActiveTetrominoLeft,
  moveActiveTetrominoRight,
  rotateActiveTetromino,
} from './core.js';

const addMoveInput = (state, key, fn) => {
  const { inputKeys } = state;
  let { time, delay } = inputKeys[key];
  if (timeNow() - time <= delay) {
    return state;
  }
  if (key === 'softDrop') {
    delay = SOFT_DROP_RATE;
  } else {
    delay = delay ? AUTO_REPEAT_RATE : DELAYED_AUTO_SHIFT;
  }
  return {
    ...state,
    ...fn(state),
    inputKeys: {
      ...inputKeys,
      [key]: {
        time: timeNow(),
        delay,
      },
    },
  };
};

const addSingleInput = (state, key, fn) => ({
  ...fn(state),
  inputKeys: {
    ...state.inputKeys,
    [key]: null,
  },
});

export const processInputKeys = state => {
  let { inputKeys } = state;
  if (inputKeys.hardDrop) {
    return addSingleInput(state, 'hardDrop', state =>
      moveActiveTetrominoDown(state, 'hard'),
    );
  }
  if (inputKeys.hold) {
    return addSingleInput(state, 'hold', state => holdActiveTetromino(state));
  }
  if (inputKeys.softDrop) {
    state = { inputKeys } = addMoveInput(state, 'softDrop', state =>
      moveActiveTetrominoDown(state, 'soft'),
    );
  }
  if (inputKeys.moveLeft) {
    state = { inputKeys } = addMoveInput(state, 'moveLeft', state =>
      moveActiveTetrominoLeft(state),
    );
  } else if (inputKeys.moveRight) {
    state = { inputKeys } = addMoveInput(state, 'moveRight', state =>
      moveActiveTetrominoRight(state),
    );
  }
  if (inputKeys.rotateClockwise) {
    state = { inputKeys } = addSingleInput(state, 'rotateClockwise', state =>
      rotateActiveTetromino(state),
    );
  } else if (inputKeys.rotateCounterclockwise) {
    state = { inputKeys } = addSingleInput(
      state,
      'rotateCounterclockwise',
      state => rotateActiveTetromino(state, true),
    );
  }
  return state;
};
