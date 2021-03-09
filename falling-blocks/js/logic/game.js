import {
  checkActiveTetrominoLock,
  getLevelDropSpeed,
  moveActiveTetrominoDown,
  shiftNextTetrominoQueue,
} from './core.js';
import { processInputKeys } from './input.js';
import { store } from './store.js';

const { getState, setState } = store;
let dropTime = 0;

export const getGameState = time => {
  let state = getState();
  let { activeTetromino, level } = state;
  state = setState(processInputKeys(state));
  const dropSpeed = getLevelDropSpeed(level);
  if (!activeTetromino || activeTetromino.isLocked) {
    state = setState(({ activeTetromino } = shiftNextTetrominoQueue(state)));
    dropTime = time;
  } else if (time - dropTime > dropSpeed) {
    const dropType = dropSpeed ? 'gravity' : 'maxGravity';
    state = setState(moveActiveTetrominoDown(state, dropType));
    dropTime = time;
  }
  return setState(checkActiveTetrominoLock(state));
};
