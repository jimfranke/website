export const BOARD_COLS = 10;
export const BOARD_ROWS = 20;
export const BLOCK_SIZE = 30;

export const POINTS_SINGLE = 100;
export const POINTS_DOUBLE = 300;
export const POINTS_TRIPLE = 500;
export const POINTS_TETRIS = 800;

export const LOCK_DELAY = 500;
export const GHOST_OPACITY = 50;

export const TETROMINOES = [
  {
    name: 'I',
    color: '#0f9Bd7',
    rotations: [
      [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
      ],
      [
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
      ],
    ],
  },
  {
    name: 'J',
    color: '#2141c6',
    rotations: [
      [
        [0, 0, 0],
        [1, 1, 1],
        [0, 0, 1],
      ],
      [
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 0],
      ],
      [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 1, 1],
        [0, 1, 0],
        [0, 1, 0],
      ],
    ],
  },
  {
    name: 'L',
    color: '#e35b02',
    rotations: [
      [
        [0, 0, 0],
        [1, 1, 1],
        [1, 0, 0],
      ],
      [
        [1, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
      ],
      [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 1],
      ],
    ],
  },
  {
    name: 'O',
    color: '#e39f02',
    rotations: [
      [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
      ],
    ],
  },
  {
    name: 'S',
    color: '#59b101',
    rotations: [
      [
        [0, 0, 0],
        [0, 1, 1],
        [1, 1, 0],
      ],
      [
        [0, 1, 0],
        [0, 1, 1],
        [0, 0, 1],
      ],
    ],
  },
  {
    name: 'T',
    color: '#af298a',
    rotations: [
      [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0],
      ],
      [
        [0, 1, 0],
        [1, 1, 0],
        [0, 1, 0],
      ],
      [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 1, 0],
        [0, 1, 1],
        [0, 1, 0],
      ],
    ],
  },
  {
    name: 'Z',
    color: '#d70f37',
    rotations: [
      [
        [0, 0, 0],
        [1, 1, 0],
        [0, 1, 1],
      ],
      [
        [0, 0, 1],
        [0, 1, 1],
        [0, 1, 0],
      ],
    ],
  },
];

export const DROP_SPEEDS = [
  800,
  740,
  680,
  620,
  560,
  500,
  440,
  380,
  320,
  260,
  200,
  140,
  120,
  100,
  80,
  60,
  40,
  20,
  10,
  0,
];
