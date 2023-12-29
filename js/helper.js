import { PLAYFIELD_COLUMNS } from "./config.js";
import { TETROMINO_NAMES } from "./config.js";
import { TETROMINOES } from "./data.js";

export function convertPositionToIndex(row, column) {
  return row * PLAYFIELD_COLUMNS + column;
}

export function random(min, max) {
  const index = Math.floor(Math.random() * (max - min) + min);
  return index;
}

export function randomFigure() {
  return TETROMINO_NAMES[random(0, TETROMINO_NAMES.length)];
}

export function randomColor(A = 1) {
  return `rgb(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, ${A})`;
}

export function generateTetromino(nameTetro) {
  const matrixTetro = TETROMINOES[nameTetro];

  const columnTetro = Math.floor(
    PLAYFIELD_COLUMNS / 2 - matrixTetro.length / 2
  );

  const rowTetro = -2;
  const colorTetro = randomColor();

  return {
    name: nameTetro,
    matrix: matrixTetro,
    row: rowTetro,
    column: columnTetro,
    color: colorTetro,
  };
}

export function isOutSideOfGameBoard(row, column, tetromino, playfield) {
  return (
    tetromino.column + column < 0 ||
    tetromino.column + column >= PLAYFIELD_COLUMNS ||
    tetromino.row + row >= playfield.length
  );
}

export function hasCollisions(row, column, tetromino, playfield) {
  return playfield[tetromino.row + row]?.[tetromino.column + column];
}
