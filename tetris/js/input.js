import {
  moveActiveTetrominoDown,
  moveActiveTetrominoLeft,
  moveActiveTetrominoRight,
  rotateActiveTetromino,
} from './core.js';

const keyMap = {
  Escape: 'pause',
  KeyZ: 'rotate-left',
  KeyX: 'rotate-right',
  ArrowUp: 'rotate-right',
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
  const { getState, setState, enqueueInput } = store;
  let moveQueue = [];
  let dasTimer;

  const enqueueMoveAction = action => {
    dasTimer = setTimeout(() => {
      moveQueue = [
        setInterval(() => {
          handleAction(action);
        }, 50),
        ...moveQueue,
      ];
    }, 150);
  };

  const executeMoveQueue = () => {
    clearTimeout(dasTimer);
    while (moveQueue.length) {
      clearInterval(moveQueue.pop());
    }
  };

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
        enqueueInput(rotateActiveTetromino(state, -1));
        break;
      case 'rotate-right':
        enqueueInput(rotateActiveTetromino(state));
        break;
      case 'move-left':
        enqueueInput(moveActiveTetrominoLeft(state));
        break;
      case 'move-right':
        enqueueInput(moveActiveTetrominoRight(state));
        break;
      case 'move-down':
        enqueueInput(moveActiveTetrominoDown(state));
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
    if (repeat) {
      return;
    }
    const action = keyMap[code];
    handleAction(keyMap[code]);
    if (!action?.startsWith('move-')) {
      return;
    }
    enqueueMoveAction(action);
  });

  document.addEventListener('keyup', () => {
    executeMoveQueue();
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
    enqueueMoveAction(action);
  });

  $controls.addEventListener('touchcancel', () => {
    executeMoveQueue();
  });

  $controls.addEventListener('touchend', () => {
    executeMoveQueue();
  });
};
