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
  const { getState, setState, addToInputQueue } = store;
  let moveQueue = [];
  let dasTimer;

  const enqueueMoveAction = action => {
    dasTimer = setTimeout(() => {
      moveQueue.push(
        setInterval(() => {
          handleAction(action);
        }, 50),
      );
    }, 100);
  };

  const executeMoveQueue = () => {
    clearTimeout(dasTimer);
    while (moveQueue.length) {
      clearInterval(moveQueue[0]);
      moveQueue = moveQueue.slice(1);
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
        addToInputQueue(rotateActiveTetromino(state, -1));
        break;
      case 'rotate-right':
        addToInputQueue(rotateActiveTetromino(state));
        break;
      case 'hold':
        addToInputQueue(holdActiveTetromino(state));
        break;
      case 'hard-drop':
        addToInputQueue(moveActiveTetrominoDown(state, true));
        break;
      case 'move-left':
        addToInputQueue(moveActiveTetrominoLeft(state));
        break;
      case 'move-right':
        addToInputQueue(moveActiveTetrominoRight(state));
        break;
      case 'move-down':
        addToInputQueue(moveActiveTetrominoDown(state));
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
