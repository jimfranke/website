import * as rotations from './rotations.js';
import * as wallKicks from './wallKicks.js';

export const tetrominoes = [
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
