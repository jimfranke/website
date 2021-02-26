import { AUTO_REPEAT_RATE, DELAYED_AUTO_SHIFT } from '../constants.js';
import {
  holdActiveTetromino,
  moveActiveTetrominoDown,
  moveActiveTetrominoLeft,
  moveActiveTetrominoRight,
  rotateActiveTetromino,
} from './core.js';

const moveInput = (state, key, fn) => {
  const { inputKeys } = state;
  let { time, delay } = inputKeys[key];
  if (performance.now() - time <= delay) {
    return state;
  }
  delay = delay ? AUTO_REPEAT_RATE : DELAYED_AUTO_SHIFT;
  return {
    ...state,
    ...fn(state),
    inputKeys: {
      ...inputKeys,
      [key]: {
        time: performance.now(),
        delay,
      },
    },
  };
};

const singleInput = (state, key, fn) => ({
  ...fn(state),
  inputKeys: {
    ...state.inputKeys,
    [key]: null,
  },
});

export const processInputKeys = state => {
  let { inputKeys } = state;

  if (inputKeys.hardDrop) {
    return singleInput(state, 'hardDrop', state =>
      moveActiveTetrominoDown(state, 'sonic'),
    );
  }
  if (inputKeys.hold) {
    return singleInput(state, 'hold', state => holdActiveTetromino(state));
  }
  if (inputKeys.moveDown) {
    state = { inputKeys } = moveInput(state, 'moveDown', state =>
      moveActiveTetrominoDown(state, 'soft'),
    );
  }
  if (inputKeys.moveLeft) {
    state = { inputKeys } = moveInput(
      state,
      'moveLeft',
      moveActiveTetrominoLeft,
    );
  } else if (inputKeys.moveRight) {
    state = { inputKeys } = moveInput(
      state,
      'moveRight',
      moveActiveTetrominoRight,
    );
  }
  if (inputKeys.rotateClockwise) {
    state = { inputKeys } = singleInput(
      state,
      'rotateClockwise',
      rotateActiveTetromino,
    );
  } else if (inputKeys.rotateCounterclockwise) {
    state = { inputKeys } = singleInput(
      state,
      'rotateCounterclockwise',
      state => rotateActiveTetromino(state, true),
    );
  }
  return state;
};
