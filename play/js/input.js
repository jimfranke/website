import {
  holdActiveTetromino,
  moveActiveTetrominoDown,
  moveActiveTetrominoLeft,
  moveActiveTetrominoRight,
  rotateActiveTetromino,
} from './engine.js';

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

export const handleMenuInput = ({ store, render, $menu, $game }) => {
  const { setState } = store;

  const handleAction = action => {
    switch (action) {
      case 'start':
        startGame();
        break;
    }
  };

  const startGame = () => {
    setState({ isPlaying: true });
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
    const { isPlaying, isPaused, isGameOver } = state;
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
        setState(rotateActiveTetromino(state, -1));
        break;
      case 'rotate-right':
        setState(rotateActiveTetromino(state));
        break;
      case 'hold':
        setState(holdActiveTetromino(state));
        break;
      case 'hard-drop':
        setState(moveActiveTetrominoDown(state, true));
        break;
      case 'move-left':
        setState(moveActiveTetrominoLeft(state));
        break;
      case 'move-right':
        setState(moveActiveTetrominoRight(state));
        break;
      case 'move-down':
        setState(moveActiveTetrominoDown(state));
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

  document.addEventListener('keydown', ({ code }) => {
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
