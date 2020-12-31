import {
  holdActiveTetromino,
  moveActiveTetrominoDown,
  moveActiveTetrominoLeft,
  moveActiveTetrominoRight,
  rotateActiveTetromino,
} from './core.js';

const keyMap = {
  Escape: 'pause',
  KeyZ: 'rotate-left',
  KeyX: 'rotate-right',
  KeyC: 'hold',
  ArrowUp: 'hard-drop',
  ArrowLeft: 'move-left',
  ArrowRight: 'move-right',
  ArrowDown: 'move-down',
};

export const handleMenuInput = ({
  store,
  render,
  getSelectedLevel,
  $menu,
  $game,
}) => {
  const { setState } = store;

  const handleAction = action => {
    switch (action) {
      case 'start':
        startGame();
        break;
    }
  };

  const startGame = () => {
    setState({
      level: getSelectedLevel(),
      isPlaying: true,
    });
    $menu.style.display = 'none';
    $game.style.display = null;
    render();
  };

  $menu.addEventListener('click', ({ target }) => {
    handleAction(target.getAttribute('data-action'));
  });
};

export const handleGameInput = ({ store, render, $paused, $controls }) => {
  const { getState, setState } = store;
  const touchTimers = [];

  const handleAction = action => {
    const state = getState();
    const { inputQueue, isPlaying, isPaused, isGameOver } = state;
    if (!isPlaying || isGameOver) {
      return;
    }
    if (action === 'pause') {
      togglePause(state);
    }
    if (isPaused) {
      return;
    }
    switch (action) {
      case 'rotate-left':
        setState({
          inputQueue: [...inputQueue, rotateActiveTetromino(state, -1)],
        });
        break;
      case 'rotate-right':
        setState({
          inputQueue: [...inputQueue, rotateActiveTetromino(state)],
        });
        break;
      case 'hold':
        setState({
          inputQueue: [...inputQueue, holdActiveTetromino(state)],
        });
        break;
      case 'hard-drop':
        setState({
          inputQueue: [...inputQueue, moveActiveTetrominoDown(state, true)],
        });
        break;
      case 'move-left':
        setState({
          inputQueue: [...inputQueue, moveActiveTetrominoLeft(state)],
        });
        break;
      case 'move-right':
        setState({
          inputQueue: [...inputQueue, moveActiveTetrominoRight(state)],
        });
        break;
      case 'move-down':
        setState({
          inputQueue: [...inputQueue, moveActiveTetrominoDown(state)],
        });
        break;
    }
  };

  const togglePause = state => {
    const isPaused = !state.isPaused;
    state = setState({ isPaused });
    if (isPaused) {
      $paused.style.display = null;
    } else {
      $paused.style.display = 'none';
      render();
    }
  };

  document.addEventListener('keydown', ({ code, repeat }) => {
    const action = keyMap[code];
    if (!action?.startsWith('move-') && repeat) {
      return;
    }
    handleAction(keyMap[code]);
  });

  $controls.addEventListener('touchstart', e => {
    const action = e.target.getAttribute('data-action');
    if (!action) {
      return;
    }
    handleAction(action);
    if (!action.startsWith('move-')) {
      return;
    }
    touchTimers.push(
      setInterval(() => {
        handleAction(action);
      }, 50),
    );
  });

  $controls.addEventListener('touchend', () => {
    while (touchTimers.length) {
      clearInterval(touchTimers.pop());
    }
  });
};
