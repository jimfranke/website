import {
  checkActiveTetrominoLock,
  getLevelDropSpeed,
  moveActiveTetrominoDown,
  shiftNextTetrominoQueue,
} from './core.js';
import { processInputKeys } from './input.js';
import { store } from './store.js';

const { getState, setState } = store;

export const getGameState = time => {
  let state = getState();
  let {
    activeTetromino,
    dropTime,
    isPlaying,
    isPaused,
    isGameOver,
    level,
  } = state;
  if (!isPlaying || isPaused || isGameOver) {
    return state;
  }
  state = setState(processInputKeys(state));
  const dropSpeed = getLevelDropSpeed(level);
  if (!activeTetromino || activeTetromino.isLocked) {
    state = setState(({ activeTetromino } = shiftNextTetrominoQueue(state)));
  } else if (time - dropTime > dropSpeed) {
    const dropType = dropSpeed ? 'gravity' : 'maxGravity';
    state = setState(moveActiveTetrominoDown(state, dropType));
  }
  return setState(checkActiveTetrominoLock(state));
};
