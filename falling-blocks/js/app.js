import {
  BLOCK_SIZE,
  BOARD_COLS,
  BOARD_ROWS,
  DROP_SPEED,
  QUEUE_SIZE,
} from './constants.js';
import {
  createGhostTetromino,
  createTetrominoQueue,
  holdActiveTetromino,
  moveActiveTetrominoDown,
  moveActiveTetrominoLeft,
  moveActiveTetrominoRight,
  rotateActiveTetromino,
} from './core.js';
import {
  drawActiveTetromino,
  drawBoard,
  drawGhostTetromino,
  drawHoldTetromino,
  drawTetrominoQueue,
} from './drawing.js';
import { createState } from './helpers.js';

export const app = $node => {
  const $linesCleared = $node.querySelector('.lines-cleared');

  const $mainCanvas = $node.querySelector('.canvas-main');
  const mainContext = $mainCanvas.getContext('2d');
  const $holdCanvas = $node.querySelector('.canvas-hold');
  const holdContext = $holdCanvas.getContext('2d');
  const $queueCanvas = $node.querySelector('.canvas-queue');
  const queueContext = $queueCanvas.getContext('2d');

  $mainCanvas.width = BLOCK_SIZE * BOARD_COLS;
  $mainCanvas.height = BLOCK_SIZE * BOARD_ROWS;
  $queueCanvas.width = BLOCK_SIZE * 4;
  $queueCanvas.height = BLOCK_SIZE * (QUEUE_SIZE * 3 - 1);
  $holdCanvas.width = BLOCK_SIZE * 4;
  $holdCanvas.height = BLOCK_SIZE * 2;

  let state = createState({
    board: Array(BOARD_ROWS)
      .fill()
      .map(() => Array(BOARD_COLS).fill(null)),
    tetrominoQueue: [],
    activeTetromino: null,
    holdTetromino: null,
    isPlaying: false,
    isGameOver: false,
    isHoldUsed: false,
    linesCleared: 0,
  });

  let dropTime;
  let rafId;

  document.addEventListener('keydown', e => {
    const { isPlaying, isGameOver } = state;
    if (isGameOver) {
      return;
    }
    if (e.code === 'Space') {
      startPause();
    }
    if (!isPlaying) {
      return;
    }
    switch (e.code) {
      case 'KeyZ':
        return (state = state.update(rotateActiveTetromino(state, -1)));
      case 'KeyX':
        return (state = state.update(rotateActiveTetromino(state)));
      case 'KeyC':
        return (state = state.update(holdActiveTetromino(state)));
      case 'ArrowLeft':
        return (state = state.update(moveActiveTetrominoLeft(state)));
      case 'ArrowRight':
        return (state = state.update(moveActiveTetrominoRight(state)));
      case 'ArrowUp':
        return (state = state.update(moveActiveTetrominoDown(state, true)));
      case 'ArrowDown':
        return (state = state.update(moveActiveTetrominoDown(state)));
    }
  });

  const startPause = () => {
    state = state.update({
      isPlaying: !state.isPlaying,
    });
    if (state.isPlaying) {
      render();
    }
  };

  const render = () => {
    const time = Date.now();
    dropTime ??= time;
    let {
      board,
      tetrominoQueue,
      activeTetromino,
      holdTetromino,
      linesCleared,
    } = state;
    $linesCleared.textContent = linesCleared;
    if (!activeTetromino || activeTetromino.isLocked) {
      tetrominoQueue = createTetrominoQueue(tetrominoQueue);
      activeTetromino = tetrominoQueue[0];
      tetrominoQueue = tetrominoQueue.slice(1);
      state = state.update({
        tetrominoQueue,
        activeTetromino,
      });
    }
    drawBoard(mainContext, board);
    drawGhostTetromino(mainContext, createGhostTetromino(state));
    drawActiveTetromino(mainContext, activeTetromino);
    drawTetrominoQueue(queueContext, tetrominoQueue);
    drawHoldTetromino(holdContext, holdTetromino);
    if (time - dropTime > DROP_SPEED) {
      state = state.update(moveActiveTetrominoDown(state));
      dropTime = time;
    }
    const { isPlaying, isGameOver } = state;
    if (!isPlaying || isGameOver) {
      rafId = cancelAnimationFrame(rafId);
      return;
    }
    rafId = requestAnimationFrame(render);
  };

  render();
  $node.style.display = null;
};
