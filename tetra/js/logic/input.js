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
  const {
    hardDrop,
    hold,
    moveDown,
    moveLeft,
    moveRight,
    rotateClockwise,
    rotateCounterclockwise,
  } = inputKeys;

  if (hardDrop) {
    return singleInput(state, 'hardDrop', state =>
      moveActiveTetrominoDown(state, 'hard'),
    );
  }
  if (hold) {
    return singleInput(state, 'hold', state => holdActiveTetromino(state));
  }
  if (moveDown) {
    state = { inputKeys } = moveInput(
      state,
      'moveDown',
      moveActiveTetrominoDown,
    );
  }
  if (moveLeft) {
    state = { inputKeys } = moveInput(
      state,
      'moveLeft',
      moveActiveTetrominoLeft,
    );
  } else if (moveRight) {
    state = { inputKeys } = moveInput(
      state,
      'moveRight',
      moveActiveTetrominoRight,
    );
  }
  if (rotateClockwise) {
    state = { inputKeys } = singleInput(
      state,
      'rotateClockwise',
      rotateActiveTetromino,
    );
  } else if (rotateCounterclockwise) {
    state = { inputKeys } = singleInput(
      state,
      'rotateCounterclockwise',
      state => rotateActiveTetromino(state, true),
    );
  }
  return state;
};
