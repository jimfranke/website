import * as kicks from './kicks.js';
import * as rotations from './rotations.js';

export const TETROMINOES = [
  {
    name: 'I',
    color: '#0f9Bd7',
    rotations: rotations.I,
    kicks: kicks.I,
    x: 3,
    y: -2,
  },
  {
    name: 'J',
    color: '#2141c6',
    rotations: rotations.J,
    kicks: kicks.JLSTZ,
    x: 3,
    y: -2,
  },
  {
    name: 'L',
    color: '#e35b02',
    rotations: rotations.L,
    kicks: kicks.JLSTZ,
    x: 3,
    y: -2,
  },
  {
    name: 'O',
    color: '#e39f02',
    rotations: rotations.O,
    kicks: null,
    x: 3,
    y: -2,
  },
  {
    name: 'S',
    color: '#59b101',
    rotations: rotations.S,
    kicks: kicks.JLSTZ,
    x: 3,
    y: -2,
  },
  {
    name: 'T',
    color: '#af298a',
    rotations: rotations.T,
    kicks: kicks.JLSTZ,
    x: 3,
    y: -2,
  },
  {
    name: 'Z',
    color: '#d70f37',
    rotations: rotations.Z,
    kicks: kicks.JLSTZ,
    x: 3,
    y: -2,
  },
];
