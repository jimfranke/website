import * as rotations from './rotations.js';
import * as wallKicks from './wallKicks.js';

export const BOARD_COLS = 10;
export const BOARD_ROWS = 20;
export const BLOCK_SIZE = 30;

export const DELAYED_AUTO_SHIFT = 110;
export const AUTO_REPEAT_RATE = 42;

export const POINTS_SINGLE = 100;
export const POINTS_DOUBLE = 300;
export const POINTS_TRIPLE = 500;
export const POINTS_QUADRUPLE = 800;

export const LOCK_DELAY = 500;
export const NEXT_QUEUE_SIZE = 6;
export const GHOST_OPACITY = 50;

export const TETROMINOES = [
  {
    name: 'I',
    color: '#0f9Bd7',
    rotations: rotations.I,
    wallKicks: wallKicks.I,
    x: 3,
    y: -3,
  },
  {
    name: 'J',
    color: '#2141c6',
    rotations: rotations.J,
    wallKicks: wallKicks.JLSTZ,
    x: 3,
    y: -3,
  },
  {
    name: 'L',
    color: '#e35b02',
    rotations: rotations.L,
    wallKicks: wallKicks.JLSTZ,
    x: 3,
    y: -3,
  },
  {
    name: 'O',
    color: '#e39f02',
    rotations: rotations.O,
    wallKicks: null,
    x: 3,
    y: -3,
  },
  {
    name: 'S',
    color: '#59b101',
    rotations: rotations.S,
    wallKicks: wallKicks.JLSTZ,
    x: 3,
    y: -3,
  },
  {
    name: 'T',
    color: '#af298a',
    rotations: rotations.T,
    wallKicks: wallKicks.JLSTZ,
    x: 3,
    y: -3,
  },
  {
    name: 'Z',
    color: '#d70f37',
    rotations: rotations.Z,
    wallKicks: wallKicks.JLSTZ,
    x: 3,
    y: -3,
  },
];

export const LEVEL_DROP_SPEEDS = [
  880,
  820,
  760,
  700,
  640,
  580,
  520,
  460,
  400,
  340,
  280,
  220,
  160,
  100,
  80,
  60,
  40,
  20,
  10,
  0,
];
