import {
  BLOCK_SIZE,
  BOARD_COLS,
  BOARD_ROWS,
  DROP_SPEED,
  QUEUE_SIZE,
} from './constants.js';
import {
  createGhostTetromino,
  createTetrominoes,
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
import { createStore } from './helpers.js';

const startPauseGame = (store, render) => {
  const { getState, setState } = store;
  const { isPlaying } = setState({
    isPlaying: !getState().isPlaying,
  });
  if (isPlaying) {
    render();
  }
};

const handleInput = (store, render) => {
  document.addEventListener('keydown', e => {
    const { isPlaying, isGameOver } = store.getState();
    if (isGameOver) {
      return;
    }
    if (e.code === 'Space') {
      startPauseGame(store, render);
    }
    if (!isPlaying) {
      return;
    }
    switch (e.code) {
      case 'KeyZ':
        return rotateActiveTetromino(store, -1);
      case 'KeyX':
        return rotateActiveTetromino(store);
      case 'KeyC':
        return holdActiveTetromino(store);
      case 'ArrowLeft':
        return moveActiveTetrominoLeft(store);
      case 'ArrowRight':
        return moveActiveTetrominoRight(store);
      case 'ArrowUp':
        return moveActiveTetrominoDown(store, true);
      case 'ArrowDown':
        return moveActiveTetrominoDown(store);
    }
  });
};

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

  const store = createStore({
    board: Array(BOARD_ROWS)
      .fill()
      .map(() => Array(BOARD_COLS).fill(null)),
    tetrominoQueue: [],
    activeTetromino: null,
    ghostTetromino: null,
    holdTetromino: null,
    isPlaying: false,
    isGameOver: false,
    isHoldUsed: false,
    linesCleared: 0,
  });

  let dropTime;
  let rafId;

  const render = () => {
    const time = Date.now();
    dropTime ??= time;
    const state = store.getState();
    let {
      board,
      tetrominoQueue,
      activeTetromino,
      holdTetromino,
      linesCleared,
    } = state;
    $linesCleared.textContent = linesCleared;
    if (!activeTetromino || activeTetromino.isLocked) {
      createTetrominoes(tetrominoQueue);
      activeTetromino = tetrominoQueue.shift();
      store.setState({
        activeTetromino,
      });
    }
    drawBoard(mainContext, board);
    drawGhostTetromino(mainContext, createGhostTetromino(store));
    drawActiveTetromino(mainContext, activeTetromino);
    drawTetrominoQueue(queueContext, tetrominoQueue);
    drawHoldTetromino(holdContext, holdTetromino);
    if (time - dropTime > DROP_SPEED) {
      moveActiveTetrominoDown(store);
      dropTime = time;
    }
    const { isPlaying, isGameOver } = state;
    if (!isPlaying || isGameOver) {
      rafId = cancelAnimationFrame(rafId);
      return;
    }
    rafId = requestAnimationFrame(render);
  };

  handleInput(store, render);
  render();
  $node.style.display = null;
};
