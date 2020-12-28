import {
  drawBoard,
  drawHoldTetromino,
  drawTetromino,
  drawTetrominoQueue,
} from './drawing.js';
import {
  createGhostTetromino,
  createTetrominoQueue,
  moveActiveTetrominoDown,
  shiftFromTetrominoQueue,
} from './engine.js';

export const createRenderer = ({
  store,
  mainContext,
  queueContext,
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
    let {
      board,
      tetrominoQueue,
      activeTetromino,
      holdTetromino,
      score,
      lines,
      level,
    } = state;
    const dropSpeed = 750;
    updateStats({ score, lines, level });
    if (!activeTetromino || activeTetromino.isLocked) {
      tetrominoQueue = createTetrominoQueue(tetrominoQueue);
      ({ tetrominoQueue, activeTetromino } = shiftFromTetrominoQueue(
        tetrominoQueue,
      ));
      state = setState({ tetrominoQueue, activeTetromino });
    }
    drawBoard(mainContext, board);
    drawTetromino(mainContext, createGhostTetromino(state));
    drawTetromino(mainContext, activeTetromino);
    drawTetrominoQueue(queueContext, tetrominoQueue);
    drawHoldTetromino(holdContext, holdTetromino);
    if (time - dropTime > dropSpeed) {
      state = setState(moveActiveTetrominoDown(state));
      dropTime = time;
    }
    const { isPaused, isGameOver } = state;
    if (isPaused || isGameOver) {
      rafId = cancelAnimationFrame(rafId);
      return;
    }
    rafId = requestAnimationFrame(render);
  };

  return render;
};
