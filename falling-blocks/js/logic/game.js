import {
  checkActiveTetrominoLock,
  getLevelDropSpeed,
  moveActiveTetrominoDown,
  shiftNextTetrominoQueue,
} from './core.js';
import { processInputKeys } from './input.js';
import { store } from './store.js';

const { getState, setState } = store;

let dropTime;

export const getGameState = time => {
  dropTime ??= time;
  let state = getState();
  let { activeTetromino, level } = state;

  state = setState(processInputKeys(state));

  const dropSpeed = getLevelDropSpeed(level);
  if (!activeTetromino || activeTetromino.isLocked) {
    state = setState(({ activeTetromino } = shiftNextTetrominoQueue(state)));
    dropTime = 0;
  } else if (time - dropTime > dropSpeed) {
    state = setState(moveActiveTetrominoDown(state, !dropSpeed));
    dropTime = time;
  }
  return setState(checkActiveTetrominoLock(state));
};
