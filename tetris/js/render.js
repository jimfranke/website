import { DROP_SPEEDS } from './constants.js';
import {
  drawBoard,
  drawHoldTetromino,
  drawNextTetrominoQueue,
  drawTetromino,
} from './drawing.js';
import {
  createGhostTetromino,
  createNextTextrominoQueue,
  moveActiveTetrominoDown,
  shiftNextTetrominoQueue,
} from './engine.js';

const finalDropSpeed = DROP_SPEEDS[DROP_SPEEDS.length - 1];

export const createRenderer = ({
  store,
  inputQueue,
  mainContext,
  nextContext,
  holdContext,
  updateStats,
}) => {
  const { getState, setState } = store;

  let dropTime;
  let rafId;

  const render = () => {
    const time = Date.now();
    dropTime ??= time;
    let state = getState();
    while (state.inputQueue.length) {
      const { inputQueue } = state;
      state = setState({
        ...inputQueue[0],
        inputQueue: inputQueue.slice(1),
      });
    }
    let {
      board,
      nextTetrominoQueue,
      activeTetromino,
      holdTetromino,
      score,
      lines,
      level,
    } = state;
    const dropSpeed = DROP_SPEEDS[level] ?? finalDropSpeed;
    if (!activeTetromino || activeTetromino.isLocked) {
      state = setState(
        ({ nextTetrominoQueue, activeTetromino } = shiftNextTetrominoQueue(
          createNextTextrominoQueue(nextTetrominoQueue),
        )),
      );
    }
    drawBoard(mainContext, board);
    drawTetromino(mainContext, createGhostTetromino(state));
    drawTetromino(mainContext, activeTetromino);
    drawNextTetrominoQueue(nextContext, nextTetrominoQueue);
    drawHoldTetromino(holdContext, holdTetromino);
    if (time - dropTime > dropSpeed) {
      state = setState(moveActiveTetrominoDown(state));
      dropTime = time;
    }
    updateStats({ score, lines, level });
    const { isPaused, isGameOver } = state;
    if (isPaused || isGameOver) {
      rafId = cancelAnimationFrame(rafId);
      return;
    }
    rafId = requestAnimationFrame(render);
  };

  return render;
};
