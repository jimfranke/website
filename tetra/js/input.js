import { $game, $gameOverMenu, $mainMenu, $pauseMenu } from './dom.js';
import { store } from './logic/store.js';
import { render } from './render.js';

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

  const addInputToState = input => {
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

  const removeInputFromState = input => {
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
      addInputToState(input);
    }
  });

  document.addEventListener('keyup', ({ code }) => {
    const input = keyMap[code];
    if (input) {
      removeInputFromState(input);
    }
  });

  document.addEventListener('touchstart', ({ target }) => {
    const input = target.getAttribute('data-game-input');
    if (input) {
      addInputToState(input);
    }
  });

  const touchEnd = ({ target }) => {
    const input = target.getAttribute('data-game-input');
    if (input) {
      removeInputFromState(input);
    }
  };

  document.addEventListener('touchcancel', touchEnd);
  document.addEventListener('touchend', touchEnd);
};

export const handleInput = () => {
  handleMenuInput();
  handleGameInput();
};
