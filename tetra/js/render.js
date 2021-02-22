import { LEVEL_DROP_SPEEDS } from './constants.js';
import {
  createGhostTetromino,
  createNextTextrominoQueue,
  isTetrominoLockable,
  lockActiveTetromino,
  moveActiveTetrominoDown,
  shiftNextTetrominoQueue,
} from './core.js';
import {
  $gameOverMenu,
  $statsLevel,
  $statsLines,
  $statsScore,
  mainContext,
} from './dom.js';
import {
  drawBoard,
  drawHoldTetromino,
  drawNextTetrominoQueue,
  drawTetromino,
} from './drawing.js';
import { processInputKeys } from './input.js';
import { store } from './store.js';

const fastestDropSpeed = LEVEL_DROP_SPEEDS[LEVEL_DROP_SPEEDS.length - 1];
const { getState, setState } = store;

let dropTime;
let rafId;

const update = (state, time) => {
  dropTime ??= time;
  let { nextTetrominoQueue, activeTetromino, level } = state;

  processInputKeys();

  let dropSpeed = LEVEL_DROP_SPEEDS[level - 1] ?? fastestDropSpeed;
  if (!activeTetromino || activeTetromino.isLocked) {
    state = setState(
      ({ nextTetrominoQueue, activeTetromino } = shiftNextTetrominoQueue(
        createNextTextrominoQueue(nextTetrominoQueue),
      )),
    );
    dropTime = time;
  } else if (time - dropTime > dropSpeed) {
    dropSpeed = dropSpeed ? null : 'gravity';
    state = setState(moveActiveTetrominoDown(state, dropSpeed));
    dropTime = time;
  }
  if (isTetrominoLockable(state)) {
    state = setState(lockActiveTetromino(state));
  }
  return state;
};

const draw = state => {
  const {
    board,
    nextTetrominoQueue,
    activeTetromino,
    holdTetromino,
    score,
    lines,
    level,
  } = state;
  drawBoard(board);
  drawTetromino(mainContext, createGhostTetromino(state));
  drawTetromino(mainContext, activeTetromino);
  drawNextTetrominoQueue(nextTetrominoQueue);
  drawHoldTetromino(holdTetromino);
  $statsLevel.textContent = level;
  $statsScore.textContent = score;
  $statsLines.textContent = lines;
};

export const render = (time = performance.now()) => {
  const state = update(getState(), time);
  draw(state);
  const { isPaused, isGameOver } = state;
  if (isPaused || isGameOver) {
    rafId = cancelAnimationFrame(rafId);
    if (isGameOver) {
      $gameOverMenu.style.display = null;
    }
    return;
  }
  rafId = requestAnimationFrame(render);
};
