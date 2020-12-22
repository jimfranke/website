import * as rotations from './data/rotations.js';
import * as wallKicks from './data/wallKicks.js';

export const tetrominoes = [
  {
    name: 'I',
    color: '#0f9Bd7',
    rotations: rotations.I,
    wallKicks: wallKicks.I,
  },
  {
    name: 'J',
    color: '#2141c6',
    rotations: rotations.J,
    wallKicks: wallKicks.JLSTZ,
  },
  {
    name: 'L',
    color: '#e35b02',
    rotations: rotations.L,
    wallKicks: wallKicks.JLSTZ,
  },
  {
    name: 'O',
    color: '#e39f02',
    rotations: rotations.O,
    wallKicks: null,
  },
  {
    name: 'S',
    color: '#59b101',
    rotations: rotations.S,
    wallKicks: wallKicks.JLSTZ,
  },
  {
    name: 'T',
    color: '#af298a',
    rotations: rotations.T,
    wallKicks: wallKicks.JLSTZ,
  },
  {
    name: 'Z',
    color: '#d70f37',
    rotations: rotations.Z,
    wallKicks: wallKicks.JLSTZ,
  },
];
