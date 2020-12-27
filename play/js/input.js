import {
  holdActiveTetromino,
  moveActiveTetrominoDown,
  moveActiveTetrominoLeft,
  moveActiveTetrominoRight,
  rotateActiveTetromino,
} from './engine.js';

export const handleInput = ({ $app, $game, $menu, store, render }) => {
  const { getState, setState } = store;
  const touchTimers = [];

  const startPause = state => {
    const isPaused = !state.isPaused;
    state = setState({ isPaused });
    if (isPaused) {
      $paused.style.display = null;
    } else {
      $paused.style.display = 'none';
      render();
    }
  };

  const dispatchKeydown = code => {
    document.dispatchEvent(new KeyboardEvent('keydown', { code }));
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

  $app.addEventListener('touchstart', e => {
    const code = e.target.getAttribute('data-keydown');
    if (!code) {
      return;
    }
    dispatchKeydown(code);
    touchTimers.push(
      setInterval(() => {
        dispatchKeydown(code);
      }, 70),
    );
  });

  $app.addEventListener('touchend', () => {
    while (touchTimers.length) {
      clearInterval(touchTimers.pop());
    }
  });

  document.addEventListener('keydown', e => {
    const state = getState();
    const { isPlaying, isPaused, isGameOver } = state;
    if (!isPlaying || isGameOver) {
      return;
    }
    if (e.code === 'Space') {
      startPause(state);
    }
    if (isPaused) {
      return;
    }
    switch (e.code) {
      case 'KeyZ':
        setState(rotateActiveTetromino(state, -1));
        break;
      case 'KeyX':
        setState(rotateActiveTetromino(state));
        break;
      case 'KeyC':
        setState(holdActiveTetromino(state));
        break;
      case 'ArrowLeft':
        setState(moveActiveTetrominoLeft(state));
        break;
      case 'ArrowRight':
        setState(moveActiveTetrominoRight(state));
        break;
      case 'ArrowUp':
        setState(moveActiveTetrominoDown(state, true));
        break;
      case 'ArrowDown':
        setState(moveActiveTetrominoDown(state));
        break;
    }
  });
};
