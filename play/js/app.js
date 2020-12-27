import { BLOCK_SIZE, BOARD_COLS, BOARD_ROWS, QUEUE_SIZE } from './constants.js';
import {
  drawBoard,
  drawHoldTetromino,
  drawTetromino,
  drawTetrominoQueue,
} from './drawing.js';
import {
  createGhostTetromino,
  createTetrominoQueue,
  holdActiveTetromino,
  moveActiveTetrominoDown,
  moveActiveTetrominoLeft,
  moveActiveTetrominoRight,
  rotateActiveTetromino,
  shiftFromTetrominoQueue,
} from './engine.js';
import { getStore } from './store.js';

export const app = $node => {
  const $menu = $node.querySelector('.menu');
  const $game = $node.querySelector('.game');
  const $paused = $game.querySelector('.paused');

  const $score = $game.querySelector('[data-score]');
  const $lines = $game.querySelector('[data-lines]');
  const $level = $game.querySelector('[data-level]');

  const $mainCanvas = $game.querySelector('.canvas-main');
  const mainContext = $mainCanvas.getContext('2d');
  const $holdCanvas = $game.querySelector('.canvas-hold');
  const holdContext = $holdCanvas.getContext('2d');
  const $queueCanvas = $game.querySelector('.canvas-queue');
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

  $menu.addEventListener('click', e => {
    const action = e.target.getAttribute('data-action');
    if (action === 'start') {
      state = setState({ isPlaying: true });
      $menu.style.display = 'none';
      $game.style.display = null;
      render();
    }
  });

  document.addEventListener('keydown', e => {
    const { isPlaying, isPaused, isGameOver } = state;
    if (!isPlaying || isGameOver) {
      return;
    }
    if (e.code === 'Space') {
      startPause();
    }
    if (isPaused) {
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
    const isPaused = !state.isPaused;
    state = setState({ isPaused });
    if (isPaused) {
      $paused.style.display = null;
    } else {
      $paused.style.display = 'none';
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
      score,
      lines,
      level,
    } = state;
    const dropSpeed = 750;
    $score.textContent = score;
    $lines.textContent = lines;
    $level.textContent = level;
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
};
