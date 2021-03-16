import {
  getIsFixedLevel,
  getSelectedLevel,
  hideGame,
  hidePauseMenu,
  showGame,
  showPauseMenu,
  toggleBackgroundVideo,
} from './dom.js';
import { timeNow } from './helpers.js';
import { store } from './logic/store.js';
import { render } from './render.js';

const inputKeyMap = {
  Escape: 'pause',
  Backspace: 'pause',
  KeyZ: 'rotateCounterclockwise',
  KeyX: 'rotateClockwise',
  KeyC: 'hold',
  Space: 'hardDrop',
  ArrowUp: 'hardDrop',
  ArrowLeft: 'moveLeft',
  ArrowDown: 'softDrop',
  ArrowRight: 'moveRight',
};

const { getState, setState, resetState } = store;

const startGame = () => {
  setState({
    isPlaying: true,
    isFixedLevel: getIsFixedLevel(),
    level: getSelectedLevel(),
  });
  render();
  toggleBackgroundVideo();
  showGame();
};

const quitGame = () => {
  hideGame();
  toggleBackgroundVideo();
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
    showPauseMenu();
  } else {
    render();
    hidePauseMenu();
  }
};

const handleMenuInput = () => {
  document.addEventListener('click', ({ target }) => {
    switch (target.getAttribute('data-menu-input')) {
      case 'start':
        return startGame();
      case 'pause':
        return togglePause();
      case 'quit':
        return quitGame();
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
          time: timeNow(),
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
    const { isPlaying } = getState();
    const input = inputKeyMap[code];
    if (!isPlaying || !input || repeat) {
      return;
    }
    switch (input) {
      case 'pause':
        return togglePause();
      default:
        return addInputToState(input);
    }
  });

  document.addEventListener('keyup', ({ code }) => {
    const { isPlaying } = getState();
    if (!isPlaying) {
      return;
    }
    const input = inputKeyMap[code];
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
