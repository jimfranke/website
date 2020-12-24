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
  shiftFromTetrominoQueue,
} from './core.js';
import {
  drawActiveTetromino,
  drawBoard,
  drawGhostTetromino,
  drawHoldTetromino,
  drawTetrominoQueue,
} from './drawing.js';
import { getStore } from './store.js';

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

  const store = getStore();
  const { getState, setState } = store;

  let state = getState();
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
        state = setState(rotateActiveTetromino(state, -1));
        break;
      case 'KeyX':
        state = setState(rotateActiveTetromino(state));
        break;
      case 'KeyC':
        state = setState(holdActiveTetromino(state));
        break;
      case 'ArrowLeft':
        state = setState(moveActiveTetrominoLeft(state));
        break;
      case 'ArrowRight':
        state = setState(moveActiveTetrominoRight(state));
        break;
      case 'ArrowUp':
        state = setState(moveActiveTetrominoDown(state, true));
        break;
      case 'ArrowDown':
        state = setState(moveActiveTetrominoDown(state));
        break;
    }
  });

  const startPause = () => {
    const isPlaying = !state.isPlaying;
    state = setState({ isPlaying });
    if (isPlaying) {
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
      ({ tetrominoQueue, activeTetromino } = shiftFromTetrominoQueue(
        tetrominoQueue,
      ));
      state = setState({ tetrominoQueue, activeTetromino });
    }
    drawBoard(mainContext, board);
    drawGhostTetromino(mainContext, createGhostTetromino(state));
    drawActiveTetromino(mainContext, activeTetromino);
    drawTetrominoQueue(queueContext, tetrominoQueue);
    drawHoldTetromino(holdContext, holdTetromino);
    if (time - dropTime > DROP_SPEED) {
      state = setState(moveActiveTetrominoDown(state));
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
