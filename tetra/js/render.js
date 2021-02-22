import {
  AUTO_REPEAT_RATE,
  DELAYED_AUTO_SHIFT,
  LEVEL_DROP_SPEEDS,
} from './constants.js';
import {
  createGhostTetromino,
  createNextTextrominoQueue,
  holdActiveTetromino,
  isTetrominoLockable,
  lockActiveTetromino,
  moveActiveTetrominoDown,
  moveActiveTetrominoLeft,
  moveActiveTetrominoRight,
  rotateActiveTetromino,
  shiftNextTetrominoQueue,
} from './core.js';
import {
  $gameOverMenu,
  $statsLevel,
  $statsLines,
  $statsScore,
  mainContext,
} from './dom.js';
import {
  drawBoard,
  drawHoldTetromino,
  drawNextTetrominoQueue,
  drawTetromino,
} from './drawing.js';
import { store } from './store.js';

const fastestDropSpeed = LEVEL_DROP_SPEEDS[LEVEL_DROP_SPEEDS.length - 1];
const { getState, setState } = store;

let dropTime;
let rafId;

const update = (state, time) => {
  dropTime ??= time;
  let { inputKeys, nextTetrominoQueue, activeTetromino, level } = state;

  if (inputKeys.hardDrop) {
    state = setState({
      ...moveActiveTetrominoDown(state, 'hard'),
      inputKeys: {
        ...inputKeys,
        hardDrop: null,
      },
    });
  }

  if (inputKeys.moveDown) {
    const { moveDown } = inputKeys;
    if (performance.now() - moveDown.time > moveDown.delay) {
      state = setState({
        ...moveActiveTetrominoDown(state),
        inputKeys: {
          ...inputKeys,
          moveDown: {
            time: performance.now(),
            delay: moveDown.delay ? AUTO_REPEAT_RATE : DELAYED_AUTO_SHIFT,
          },
        },
      });
    }
  }

  if (inputKeys.moveLeft) {
    const { moveLeft } = inputKeys;
    if (performance.now() - moveLeft.time > moveLeft.delay) {
      state = setState({
        ...moveActiveTetrominoLeft(state),
        inputKeys: {
          ...inputKeys,
          moveLeft: {
            time: performance.now(),
            delay: moveLeft.delay ? AUTO_REPEAT_RATE : DELAYED_AUTO_SHIFT,
          },
        },
      });
    }
  } else if (inputKeys.moveRight) {
    const { moveRight } = inputKeys;
    if (performance.now() - moveRight.time > moveRight.delay) {
      state = setState({
        ...moveActiveTetrominoRight(state),
        inputKeys: {
          ...inputKeys,
          moveRight: {
            time: performance.now(),
            delay: moveRight.delay ? AUTO_REPEAT_RATE : DELAYED_AUTO_SHIFT,
          },
        },
      });
    }
  }

  if (inputKeys.rotateClockwise) {
    state = setState({
      ...rotateActiveTetromino(state),
      inputKeys: {
        ...inputKeys,
        rotateClockwise: null,
      },
    });
  } else if (inputKeys.rotateCounterclockwise) {
    state = setState({
      ...rotateActiveTetromino(state, true),
      inputKeys: {
        ...inputKeys,
        rotateCounterclockwise: null,
      },
    });
  }

  if (inputKeys.hold) {
    state = setState({
      ...holdActiveTetromino(state),
      inputKeys: {
        ...inputKeys,
        hold: null,
      },
    });
  }

  let dropSpeed = LEVEL_DROP_SPEEDS[level - 1] ?? fastestDropSpeed;
  if (!activeTetromino || activeTetromino.isLocked) {
    state = setState(
      ({ nextTetrominoQueue, activeTetromino } = shiftNextTetrominoQueue(
        createNextTextrominoQueue(nextTetrominoQueue),
      )),
    );
    dropTime = time;
  } else if (time - dropTime > dropSpeed) {
    dropSpeed = dropSpeed ? null : 'gravity';
    state = setState(moveActiveTetrominoDown(state, dropSpeed));
    dropTime = time;
  }
  if (isTetrominoLockable(state)) {
    state = setState(lockActiveTetromino(state));
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
  drawBoard(board);
  drawTetromino(mainContext, createGhostTetromino(state));
  drawTetromino(mainContext, activeTetromino);
  drawNextTetrominoQueue(nextTetrominoQueue);
  drawHoldTetromino(holdTetromino);
  $statsLevel.textContent = level;
  $statsScore.textContent = score;
  $statsLines.textContent = lines;
};

export const render = (time = performance.now()) => {
  const state = update(getState(), time);
  draw(state);
  const { isPaused, isGameOver } = state;
  if (isPaused || isGameOver) {
    rafId = cancelAnimationFrame(rafId);
    if (isGameOver) {
      $gameOverMenu.style.display = null;
    }
    return;
  }
  rafId = requestAnimationFrame(render);
};
