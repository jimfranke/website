import * as rotations from './rotations.js';
import * as wallKicks from './wallKicks.js';

export const TETROMINOES = [
  {
    name: 'I',
    color: '#d70f37',
    rotations: rotations.I,
    wallKicks: wallKicks.I,
    x: 3,
    y: -2,
  },
  {
    name: 'J',
    color: '#2141c6',
    rotations: rotations.J,
    wallKicks: wallKicks.JLSTZ,
    x: 3,
    y: -1,
  },
  {
    name: 'L',
    color: '#e35b02',
    rotations: rotations.L,
    wallKicks: wallKicks.JLSTZ,
    x: 3,
    y: -1,
  },
  {
    name: 'O',
    color: '#e39f02',
    rotations: rotations.O,
    wallKicks: null,
    x: 3,
    y: -1,
  },
  {
    name: 'S',
    color: '#af298a',
    rotations: rotations.S,
    wallKicks: wallKicks.JLSTZ,
    x: 3,
    y: -1,
  },
  {
    name: 'T',
    color: '#0f9Bd7',
    rotations: rotations.T,
    wallKicks: wallKicks.T,
    x: 3,
    y: -1,
  },
  {
    name: 'Z',
    color: '#59b101',
    rotations: rotations.Z,
    wallKicks: wallKicks.JLSTZ,
    x: 3,
    y: -1,
  },
];
