// https://tetris.wiki/Super_Rotation_System

export const I = [
  {
    rotation: 0,
    direction: 1,
    tests: [
      [0, 0],
      [-2, 0],
      [1, 0],
      [-2, -1],
      [1, 2],
    ],
  },
  {
    rotation: 1,
    direction: -1,
    tests: [
      [0, 0],
      [2, 0],
      [-1, 0],
      [2, 1],
      [-1, -2],
    ],
  },
  {
    rotation: 1,
    direction: 1,
    tests: [
      [0, 0],
      [-1, 0],
      [2, 0],
      [-1, 2],
      [2, -1],
    ],
  },
  {
    rotation: 2,
    direction: -1,
    tests: [
      [0, 0],
      [1, 0],
      [-2, 0],
      [1, -2],
      [-2, 1],
    ],
  },
  {
    rotation: 2,
    direction: 1,
    tests: [
      [0, 0],
      [2, 0],
      [-1, 0],
      [2, 1],
      [-1, -2],
    ],
  },
  {
    rotation: 3,
    direction: -1,
    tests: [
      [0, 0],
      [-2, 0],
      [1, 0],
      [-2, -1],
      [1, 2],
    ],
  },
  {
    rotation: 3,
    direction: 1,
    tests: [
      [0, 0],
      [1, 0],
      [-2, 0],
      [1, -2],
      [-2, 1],
    ],
  },
  {
    rotation: 0,
    direction: -1,
    tests: [
      [0, 0],
      [-1, 0],
      [2, 0],
      [-1, 2],
      [2, -1],
    ],
  },
];

export const JLSTZ = [
  {
    rotation: 0,
    direction: 1,
    tests: [
      [0, 0],
      [-1, 0],
      [-1, 1],
      [0, -2],
      [-1, -2],
    ],
  },
  {
    rotation: 1,
    direction: -1,
    tests: [
      [0, 0],
      [1, 0],
      [1, -1],
      [0, 2],
      [1, 2],
    ],
  },
  {
    rotation: 1,
    direction: 1,
    tests: [
      [0, 0],
      [1, 0],
      [1, -1],
      [0, 2],
      [1, 2],
    ],
  },
  {
    rotation: 2,
    direction: -1,
    tests: [
      [0, 0],
      [-1, 0],
      [-1, 1],
      [0, -2],
      [-1, -2],
    ],
  },
  {
    rotation: 2,
    direction: 1,
    tests: [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, -2],
      [1, -2],
    ],
  },
  {
    rotation: 3,
    direction: -1,
    tests: [
      [0, 0],
      [-1, 0],
      [-1, -1],
      [0, 2],
      [-1, 2],
    ],
  },
  {
    rotation: 3,
    direction: 1,
    tests: [
      [0, 0],
      [-1, 0],
      [-1, -1],
      [0, 2],
      [-1, 2],
    ],
  },
  {
    rotation: 0,
    direction: -1,
    tests: [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, -2],
      [1, -2],
    ],
  },
];
