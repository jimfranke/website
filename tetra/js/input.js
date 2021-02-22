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
    $mainMenu.style.display = 'none';
    $game.style.display = null;
    setTimeout(() => {
      setState({
        level: $mainMenu.querySelector('.main-menu__input-level-select').value,
        isPlaying: true,
      });
      render();
    }, 3000);
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

export const processInputKeys = () => {
  const { getState, setState } = store;
  let state = getState();
  const { inputKeys } = state;

  if (inputKeys.hardDrop) {
    state = setState({
      ...moveActiveTetrominoDown(state, 'hard'),
      inputKeys: {
        ...inputKeys,
        hardDrop: null,
      },
    });
    return;
  }

  if (inputKeys.hold) {
    state = setState({
      ...holdActiveTetromino(state),
      inputKeys: {
        ...inputKeys,
        hold: null,
      },
    });
    return;
  }

  if (inputKeys.moveDown) {
    const { moveDown } = inputKeys;
    const { time, delay } = moveDown;
    if (performance.now() - time > delay) {
      state = setState({
        ...moveActiveTetrominoDown(state),
        inputKeys: {
          ...inputKeys,
          moveDown: {
            time: performance.now(),
            delay: delay ? AUTO_REPEAT_RATE : DELAYED_AUTO_SHIFT,
          },
        },
      });
    }
  }

  if (inputKeys.moveLeft) {
    const { moveLeft } = inputKeys;
    const { time, delay } = moveLeft;
    if (performance.now() - time > delay) {
      state = setState({
        ...moveActiveTetrominoLeft(state),
        inputKeys: {
          ...inputKeys,
          moveLeft: {
            time: performance.now(),
            delay: delay ? AUTO_REPEAT_RATE : DELAYED_AUTO_SHIFT,
          },
        },
      });
    }
  } else if (inputKeys.moveRight) {
    const { moveRight } = inputKeys;
    const { time, delay } = moveRight;
    if (performance.now() - time > delay) {
      state = setState({
        ...moveActiveTetrominoRight(state),
        inputKeys: {
          ...inputKeys,
          moveRight: {
            time: performance.now(),
            delay: delay ? AUTO_REPEAT_RATE : DELAYED_AUTO_SHIFT,
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
};

export const handleInput = () => {
  handleMenuInput();
  handleGameInput();
};
