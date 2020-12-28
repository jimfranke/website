import {
  drawBoard,
  drawHoldTetromino,
  drawNextTetrominoes,
  drawTetromino,
} from './drawing.js';
import {
  createGhostTetromino,
  createNextTextrominoes,
  moveActiveTetrominoDown,
  shiftNextTetromino,
} from './engine.js';

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

  const render = () => {
    const time = Date.now();
    dropTime ??= time;
    let state = getState();
    let {
      board,
      nextTextrominoes,
      activeTetromino,
      holdTetromino,
      score,
      lines,
      level,
    } = state;
    const dropSpeed = 750;
    if (!activeTetromino || activeTetromino.isLocked) {
      state = setState(
        ({ nextTextrominoes, activeTetromino } = shiftNextTetromino(
          createNextTextrominoes(nextTextrominoes),
        )),
      );
    }
    drawBoard(mainContext, board);
    drawTetromino(mainContext, createGhostTetromino(state));
    drawTetromino(mainContext, activeTetromino);
    drawNextTetrominoes(nextContext, nextTextrominoes);
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
