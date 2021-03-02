import { LEVEL_DROP_SPEEDS } from '../constants.js';
import {
  isTetrominoLockable,
  lockActiveTetromino,
  moveActiveTetrominoDown,
  shiftNextTetrominoQueue,
} from './core.js';
import { processInputKeys } from './input.js';
import { store } from './store.js';

const fastestDropSpeed = LEVEL_DROP_SPEEDS[LEVEL_DROP_SPEEDS.length - 1];
const { getState, setState } = store;

let dropTime;

export const getGameState = time => {
  dropTime ??= time;
  let state = getState();
  let { activeTetromino, level } = state;

  state = setState(processInputKeys(state));

  let dropSpeed = LEVEL_DROP_SPEEDS[level - 1] ?? fastestDropSpeed;
  if (!activeTetromino || activeTetromino.isLocked) {
    state = setState(({ activeTetromino } = shiftNextTetrominoQueue(state)));
    dropTime = 0;
  }
  if (time - dropTime > dropSpeed) {
    const dropType = dropSpeed ? null : 'sonic';
    state = setState(moveActiveTetrominoDown(state, dropType));
    dropTime = time;
  }
  if (isTetrominoLockable(state)) {
    state = setState(lockActiveTetromino(state));
  }
  return state;
};
