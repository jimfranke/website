import {
  BLOCK_SIZE,
  BOARD_COLS,
  BOARD_ROWS,
  DROP_SPEED,
  QUEUE_SIZE,
} from './constants.js';
import {
  createGhostTetromino,
  fillTetrominoQueue,
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

  const state = createState({
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
    const { board, activeTetromino, isPlaying, isGameOver } = state;
    if (isGameOver) {
      return;
    }
    if (e.code === 'Space') {
      startPauseGame();
    }
    if (!isPlaying) {
      return;
    }
    switch (e.code) {
      case 'KeyZ':
        return rotateActiveTetromino(state, -1);
      case 'KeyX':
        return rotateActiveTetromino(state);
      case 'KeyC':
        return holdActiveTetromino(state);
      case 'ArrowLeft':
        return moveActiveTetrominoLeft(state);
      case 'ArrowRight':
        return moveActiveTetrominoRight(state);
      case 'ArrowUp':
        return moveActiveTetrominoDown(state, true);
      case 'ArrowDown':
        return moveActiveTetrominoDown(state);
    }
  });

  const startPauseGame = () => {
    state.update({
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
      fillTetrominoQueue(tetrominoQueue);
      activeTetromino = tetrominoQueue.shift();
      state.update({
        activeTetromino,
      });
    }
    const ghostTetromino = createGhostTetromino(state);
    drawBoard(mainContext, board);
    drawGhostTetromino(mainContext, ghostTetromino);
    drawActiveTetromino(mainContext, activeTetromino);
    drawTetrominoQueue(queueContext, tetrominoQueue);
    drawHoldTetromino(holdContext, holdTetromino);
    if (time - dropTime > DROP_SPEED) {
      moveActiveTetrominoDown(state);
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
