import { AUTO_REPEAT_RATE, DELAYED_AUTO_SHIFT } from './constants.js';
import {
  holdActiveTetromino,
  moveActiveTetrominoDown,
  moveActiveTetrominoLeft,
  moveActiveTetrominoRight,
  rotateActiveTetromino,
} from './core.js';
import { $game, $gameOverMenu, $mainMenu, $pauseMenu } from './dom.js';
import { render } from './render.js';
import { store } from './store.js';

const keyMap = {
  Escape: 'pause',
  KeyZ: 'rotateCounterclockwise',
  KeyX: 'rotateClockwise',
  KeyC: 'hold',
  ArrowUp: 'hardDrop',
  ArrowLeft: 'moveLeft',
  ArrowRight: 'moveRight',
  ArrowDown: 'moveDown',
};

const handleMenuInput = () => {
  const { getState, setState, resetState } = store;

  const startGame = () => {
    setState({
      level: $mainMenu.querySelector('.main-menu__input-level-select').value,
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
    $gameOverMenu.style.display = 'none';
  };

  const togglePause = state => {
    const isPaused = !state.isPaused;
    if (state.isGameOver) {
      return;
    }
    setState({ isPaused });
    if (isPaused) {
      $pauseMenu.style.display = null;
    } else {
      $pauseMenu.style.display = 'none';
      render();
    }
  };

  document.addEventListener('click', ({ target }) => {
    const state = getState();
    switch (target.getAttribute('data-menu-input')) {
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
  });
};

const handleGameInput = () => {
  const { getState, setState } = store;

  const addInput = input => {
    const { inputKeys } = getState();
    setState({
      inputKeys: {
        ...inputKeys,
        [input]: {
          time: performance.now(),
          delay: 0,
        },
      },
    });
  };

  const removeInput = input => {
    const { inputKeys } = getState();
    setState({
      inputKeys: {
        ...inputKeys,
        [input]: null,
      },
    });
  };

  document.addEventListener('keydown', ({ code, repeat }) => {
    const input = keyMap[code];
    if (input && !repeat) {
      addInput(input);
    }
  });

  document.addEventListener('keyup', ({ code }) => {
    const input = keyMap[code];
    if (input) {
      removeInput(input);
    }
  });

  document.addEventListener('touchstart', ({ target }) => {
    const input = target.getAttribute('data-game-input');
    if (input) {
      addInput(input);
    }
  });

  const touchEnd = ({ target }) => {
    const input = target.getAttribute('data-game-input');
    if (input) {
      removeInput(input);
    }
  };

  document.addEventListener('touchcancel', touchEnd);
  document.addEventListener('touchend', touchEnd);
};

const moveInput = (state, key, fn) => {
  const { inputKeys } = state;
  const { time, delay } = inputKeys[key];
  if (performance.now() - time <= delay) {
    return state;
  }
  delay = delay ? AUTO_REPEAT_RATE : DELAYED_AUTO_SHIFT;
  return {
    ...state,
    ...fn(state),
    inputKeys: {
      ...inputKeys,
      [key]: {
        time: performance.now(),
        delay,
      },
    },
  };
};

const singleInput = (state, key, fn) => ({
  ...fn(state),
  inputKeys: {
    ...state.inputKeys,
    [key]: null,
  },
});

export const processInputKeys = state => {
  let { inputKeys } = state;
  const {
    hardDrop,
    hold,
    moveDown,
    moveLeft,
    moveRight,
    rotateClockwise,
    rotateCounterclockwise,
  } = inputKeys;

  if (hardDrop) {
    return singleInput(state, 'hardDrop', state =>
      moveActiveTetrominoDown(state, 'hard'),
    );
  }
  if (hold) {
    return singleInput(state, 'hold', state => holdActiveTetromino(state));
  }
  if (moveDown) {
    state = { inputKeys } = moveInput(
      state,
      'moveDown',
      moveActiveTetrominoDown,
    );
  }
  if (moveLeft) {
    state = { inputKeys } = moveInput(
      state,
      'moveLeft',
      moveActiveTetrominoLeft,
    );
  } else if (moveRight) {
    state = { inputKeys } = moveInput(
      state,
      'moveRight',
      moveActiveTetrominoRight,
    );
  }
  if (rotateClockwise) {
    state = { inputKeys } = singleInput(
      state,
      'rotateClockwise',
      rotateActiveTetromino,
    );
  } else if (rotateCounterclockwise) {
    state = { inputKeys } = singleInput(
      state,
      'rotateCounterclockwise',
      state => rotateActiveTetromino(state, true),
    );
  }
  return state;
};

export const handleInput = () => {
  handleMenuInput();
  handleGameInput();
};
