import { DROP_SPEEDS } from './constants.js';
import { moveActiveTetrominoDown, useNextTetromino } from './core.js';
import { drawBoard, drawNextTetromino, drawTetromino } from './drawing.js';

const lastDropSpeed = DROP_SPEEDS[DROP_SPEEDS.length - 1];

export const createRenderer = ({
  store,
  mainContext,
  nextContext,
  updateStats,
}) => {
  const { getState, setState } = store;

  let dropTime;
  let rafId;

  const update = (state, time) => {
    dropTime ??= time;
    let { inputQueue, activeTetromino, level } = state;
    while (inputQueue.length) {
      inputQueue = state.inputQueue;
      state = setState({
        ...inputQueue[0],
        inputQueue: inputQueue.slice(1),
      });
    }
    const dropSpeed = DROP_SPEEDS[level] ?? lastDropSpeed;
    if (!activeTetromino || activeTetromino.isLocked) {
      state = setState(useNextTetromino(state));
    }
    if (time - dropTime > dropSpeed) {
      state = setState(moveActiveTetrominoDown(state));
      dropTime = time;
    }
    return state;
  };

  const draw = state => {
    const {
      board,
      nextTetromino,
      activeTetromino,
      score,
      lines,
      level,
    } = state;
    drawBoard(mainContext, board);
    drawTetromino(mainContext, activeTetromino);
    drawNextTetromino(nextContext, nextTetromino);
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
