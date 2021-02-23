import { $game, $gameOverMenu, $mainMenu, $pauseMenu } from './dom.js';
import { store } from './logic/store.js';
import { render } from './render.js';

const keyMap = {
  KeyZ: 'rotateCounterclockwise',
  KeyX: 'rotateClockwise',
  KeyC: 'hold',
  ArrowUp: 'hardDrop',
  ArrowLeft: 'moveLeft',
  ArrowRight: 'moveRight',
  ArrowDown: 'moveDown',
};
const { getState, setState, resetState } = store;

const startGame = () => {
  setState({
    level: $mainMenu.querySelector('.main-menu__input-level-select').value,
    isPlaying: true,
  });
  render();
  $mainMenu.style.display = 'none';
  $game.style.display = null;
};

const quitGame = () => {
  $mainMenu.style.display = null;
  $game.style.display = 'none';
  $pauseMenu.style.display = 'none';
  $gameOverMenu.style.display = 'none';
  resetState();
};

const togglePause = () => {
  const state = getState();
  const isPaused = !state.isPaused;
  if (state.isGameOver) {
    return;
  }
  setState({ isPaused });
  if (isPaused) {
    $pauseMenu.style.display = null;
  } else {
    render();
    $pauseMenu.style.display = 'none';
  }
};

const handleMenuInput = () => {
  document.addEventListener('click', ({ target }) => {
    switch (target.getAttribute('data-menu-input')) {
      case 'start':
        startGame();
        break;
      case 'pause':
        togglePause();
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
    if (code === 'Escape') {
      togglePause();
      return;
    }
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
