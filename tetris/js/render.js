import { DROP_SPEEDS, LOCK_DELAY } from './constants.js';
import {
  createGhostTetromino,
  createNextTextrominoQueue,
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

const fastestDropSpeed = DROP_SPEEDS[DROP_SPEEDS.length - 1];

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
    const dropSpeed = DROP_SPEEDS[level] ?? fastestDropSpeed;
    if (!activeTetromino || activeTetromino.isLocked) {
      state = setState(
        ({ nextTetrominoQueue, activeTetromino } = shiftNextTetrominoQueue(
          createNextTextrominoQueue(nextTetrominoQueue),
        )),
      );
    }
    if (time - dropTime > dropSpeed) {
      state = setState(moveActiveTetrominoDown(state));
      activeTetromino = state.activeTetromino;
      dropTime = time;
    }
    let { lockDelay } = activeTetromino;
    if (lockDelay) {
      lockDelay = time - lockDelay;
      state = setState({
        activeTetromino: {
          ...activeTetromino,
          lockDelay,
        },
      });
      if (lockDelay > LOCK_DELAY) {
        state = setState(lockActiveTetromino(state));
      }
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
    updateStats({ score, lines, level });
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
