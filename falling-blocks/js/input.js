import { AUTO_REPEAT_RATE, DELAYED_AUTO_SHIFT } from './constants.js';
import {
  holdActiveTetromino,
  moveActiveTetrominoDown,
  moveActiveTetrominoLeft,
  moveActiveTetrominoRight,
  rotateActiveTetromino,
} from './core.js';

const keyMap = {
  Escape: 'pause',
  KeyZ: 'rotate-counterclockwise',
  KeyX: 'rotate-clockwise',
  KeyC: 'hold',
  ArrowUp: 'hard-drop',
  ArrowLeft: 'move-left',
  ArrowRight: 'move-right',
  ArrowDown: 'move-down',
};

export const handleInput = ({
  store,
  render,
  getSelectedLevel,
  $mainMenu,
  $game,
  $pauseMenu,
}) => {
  const { getState, setState, resetState, enqueueInput } = store;
  let moveQueue = [];
  let dasTimer;

  const startGame = () => {
    setState({
      level: getSelectedLevel(),
      isPlaying: true,
    });
    $mainMenu.style.display = 'none';
    $game.style.display = null;
    render();
  };

  const quitGame = () => {
    resetState();
    $mainMenu.style.display = null;
    $game.style.display = 'none';
    $pauseMenu.style.display = 'none';
  };

  const togglePause = state => {
    const isPaused = !state.isPaused;
    setState({ isPaused });
    if (isPaused) {
      $pauseMenu.style.display = null;
    } else {
      $pauseMenu.style.display = 'none';
      render();
    }
  };

  const enqueueMove = (fn, state) => {
    enqueueInput(fn(state));
    dasTimer = setTimeout(() => {
      moveQueue = [
        setInterval(() => {
          state = getState();
          enqueueInput(fn(state));
        }, AUTO_REPEAT_RATE),
        ...moveQueue,
      ];
    }, DELAYED_AUTO_SHIFT);
  };

  const executeMoveQueue = () => {
    clearTimeout(dasTimer);
    while (moveQueue.length) {
      clearInterval(moveQueue.pop());
    }
  };

  const handleMenuInput = input => {
    const state = getState();
    switch (input) {
      case 'start':
        startGame(state);
        break;
      case 'pause':
        togglePause(state);
        break;
      case 'quit':
        quitGame();
        break;
    }
  };

  const handleGameInput = input => {
    const state = getState();
    const { isPlaying, isPaused, isGameOver } = state;
    if (input === 'pause') {
      togglePause(state);
      return;
    }
    if (!isPlaying || isGameOver || isPaused) {
      return;
    }
    switch (input) {
      case 'rotate-counterclockwise':
        enqueueInput(rotateActiveTetromino(state, true));
        break;
      case 'rotate-clockwise':
        enqueueInput(rotateActiveTetromino(state));
        break;
      case 'hold':
        enqueueInput(holdActiveTetromino(state));
        break;
      case 'hard-drop':
        enqueueInput(moveActiveTetrominoDown(state, true));
        break;
      case 'move-left':
        enqueueMove(moveActiveTetrominoLeft, state);
        break;
      case 'move-right':
        enqueueMove(moveActiveTetrominoRight, state);
        break;
      case 'move-down':
        enqueueMove(moveActiveTetrominoDown, state);
        break;
    }
  };

  document.addEventListener('click', ({ target }) => {
    handleMenuInput(target.getAttribute('data-menu-input'));
  });

  document.addEventListener('keydown', ({ code, repeat }) => {
    if (!repeat) {
      handleGameInput(keyMap[code]);
    }
  });

  document.addEventListener('keyup', () => {
    executeMoveQueue();
  });

  document.addEventListener('touchstart', e => {
    const input = e.target.getAttribute('data-game-input');
    if (input) {
      handleGameInput(input);
    }
  });

  document.addEventListener('touchcancel', () => {
    executeMoveQueue();
  });

  document.addEventListener('touchend', () => {
    executeMoveQueue();
  });
};
