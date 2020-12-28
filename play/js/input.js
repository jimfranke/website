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

export const handleInput = ({
  $app,
  $menu,
  $game,
  $paused,
  $controls,
  store,
  render,
}) => {
  const { getState, setState } = store;
  const touchTimers = [];

  const handleAction = action => {
    const state = getState();
    const { isPlaying, isPaused, isGameOver } = state;
    if (!isPlaying || isGameOver) {
      return;
    }
    if (action === 'pause') {
      pauseResume(state);
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

  const pauseResume = state => {
    const isPaused = !state.isPaused;
    state = setState({ isPaused });
    if (isPaused) {
      $paused.style.display = null;
    } else {
      $paused.style.display = 'none';
      render();
    }
  };

  $menu.addEventListener('click', e => {
    const action = e.target.getAttribute('data-action');
    if (action === 'start') {
      setState({ isPlaying: true });
      $menu.style.display = 'none';
      $game.style.display = null;
      render();
    }
  });

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
