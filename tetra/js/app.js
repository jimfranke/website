import {
  BLOCK_SIZE,
  BOARD_COLS,
  BOARD_ROWS,
  NEXT_QUEUE_SIZE,
} from './constants.js';
import { $holdCanvas, $mainCanvas, $nextCanvas } from './dom.js';
import { handleInput } from './input.js';
import { render } from './render.js';

$mainCanvas.width = BLOCK_SIZE * BOARD_COLS;
$mainCanvas.height = BLOCK_SIZE * BOARD_ROWS;
$nextCanvas.width = BLOCK_SIZE * 4;
$nextCanvas.height = BLOCK_SIZE * (NEXT_QUEUE_SIZE * 3 - 1);
$holdCanvas.width = BLOCK_SIZE * 4;
$holdCanvas.height = BLOCK_SIZE * 2;

render();
handleInput();
