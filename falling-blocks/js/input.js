import {
  holdActiveTetromino,
  moveActiveTetrominoDown,
  moveActiveTetrominoLeft,
  moveActiveTetrominoRight,
  rotateActiveTetromino,
} from './core.js';

const keyMap = {
  Escape: 'pause',
  KeyZ: 'rotate-counterclockwise',
  KeyX: 'rotate-clockwise',
  KeyC: 'hold',
  ArrowUp: 'hard-drop',
  ArrowLeft: 'move-left',
  ArrowRight: 'move-right',
  ArrowDown: 'move-down',
};

export const handleInput = ({
  store,
  render,
  getSelectedLevel,
  $menu,
  $game,
  $paused,
}) => {
  const { getState, setState, enqueueInput } = store;
  let moveQueue = [];
  let dasTimer;

  const startGame = () => {
    setState({
      level: getSelectedLevel(),
      isPlaying: true,
    });
    $menu.style.display = 'none';
    $game.style.display = null;
    render();
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

  const enqueueMoveAction = action => {
    dasTimer = setTimeout(() => {
      moveQueue = [
        setInterval(() => {
          handleGameAction(action);
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

  const handleMenuAction = action => {
    const state = getState();
    switch (action) {
      case 'start':
        startGame(state);
        break;
      case 'pause':
        togglePause(state);
        break;
      case 'quit':
        window.location.reload();
        break;
    }
  };

  const handleGameAction = action => {
    const state = getState();
    const { isPlaying, isPaused, isGameOver } = state;
    if (action === 'pause') {
      togglePause(state);
      return;
    }
    if (!isPlaying || isGameOver || isPaused) {
      return;
    }
    switch (action) {
      case 'rotate-counterclockwise':
        enqueueInput(rotateActiveTetromino(state, true));
        break;
      case 'rotate-clockwise':
        enqueueInput(rotateActiveTetromino(state));
        break;
      case 'hold':
        enqueueInput(holdActiveTetromino(state));
        break;
      case 'hard-drop':
        enqueueInput(moveActiveTetrominoDown(state, true));
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

  document.addEventListener('click', ({ target }) => {
    handleMenuAction(target.getAttribute('data-menu-action'));
  });

  document.addEventListener('keydown', ({ code, repeat }) => {
    if (repeat) {
      return;
    }
    const action = keyMap[code];
    handleGameAction(keyMap[code]);
    if (!action?.startsWith('move-')) {
      return;
    }
    enqueueMoveAction(action);
  });

  document.addEventListener('keyup', () => {
    executeMoveQueue();
  });

  document.addEventListener('touchstart', e => {
    const action = e.target.getAttribute('data-game-action');
    if (!action) {
      return;
    }
    handleGameAction(action);
    if (!action.startsWith('move-')) {
      return;
    }
    enqueueMoveAction(action);
  });

  document.addEventListener('touchcancel', () => {
    executeMoveQueue();
  });

  document.addEventListener('touchend', () => {
    executeMoveQueue();
  });
};
