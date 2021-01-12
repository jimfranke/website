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
  drawBoard,
  drawHoldTetromino,
  drawNextTetrominoQueue,
  drawTetromino,
} from './drawing.js';

const fastestDropSpeed = LEVEL_DROP_SPEEDS[LEVEL_DROP_SPEEDS.length - 1];

export const createRenderer = ({
  store,
  mainContext,
  nextContext,
  holdContext,
  updateStats,
}) => {
  const { getState, setState } = store;
  let dropTime;
  let rafId;

  const update = (state, time) => {
    dropTime ??= time;
    let { inputQueue, nextTetrominoQueue, activeTetromino, level } = state;
    while (inputQueue.length) {
      inputQueue = state.inputQueue;
      state = setState({
        ...inputQueue[0],
        inputQueue: inputQueue.slice(1),
      });
    }
    let dropSpeed = LEVEL_DROP_SPEEDS[level - 1] ?? fastestDropSpeed;
    if (!activeTetromino || activeTetromino.isLocked) {
      state = setState(
        ({ nextTetrominoQueue, activeTetromino } = shiftNextTetrominoQueue(
          createNextTextrominoQueue(nextTetrominoQueue),
        )),
      );
      dropTime = time;
    } else if (time - dropTime > dropSpeed) {
      dropSpeed = dropSpeed ? null : 'sonic';
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
    drawBoard(mainContext, board);
    drawTetromino(mainContext, createGhostTetromino(state));
    drawTetromino(mainContext, activeTetromino);
    drawNextTetrominoQueue(nextContext, nextTetrominoQueue);
    drawHoldTetromino(holdContext, holdTetromino);
    updateStats({ level, score, lines });
  };

  const render = (time = performance.now()) => {
    const state = update(getState(), time);
    draw(state);
    const { isPaused, isGameOver } = state;
    if (isPaused || isGameOver) {
      rafId = cancelAnimationFrame(rafId);
      return;
    }
    rafId = requestAnimationFrame(render);
  };

  return render;
};
