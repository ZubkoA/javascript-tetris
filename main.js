import {
  isOutSideOfGameBoard,
  hasCollisions,
  generateTetromino,
  convertPositionToIndex,
  randomFigure,
} from "./js/helper.js";

import { PLAYFIELD_COLUMNS, PLAYFIELD_ROWS, playScores } from "./js/config.js";

const btnNew = document.querySelector(".btn");
const currentScore = document.querySelector(".current-score");

let playfield, scores, timeoutId, requestId;
let tetromino = { ...generateTetromino(randomFigure()) };

console.log(tetromino);

const init = function () {
  scores = 0;
  // playing = true;

  currentScore.textContent = 0;
};
init();

function generatePlayfield() {
  for (let i = 0; i < PLAYFIELD_ROWS * PLAYFIELD_COLUMNS; i++) {
    const div = document.createElement("div");
    document.querySelector(".tetris").append(div);
  }

  playfield = new Array(PLAYFIELD_ROWS)
    .fill()
    .map(() => new Array(PLAYFIELD_COLUMNS).fill(0));
}

generatePlayfield();
generateTetromino(randomFigure());
const cells = document.querySelectorAll(".tetris div");

// малюємо поле
function drawPlayField() {
  for (let row = 0; row < PLAYFIELD_ROWS; row++) {
    for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
      const name = playfield[row][column];
      const cellIndex = convertPositionToIndex(row, column);

      cells[cellIndex].classList.add(name);
    }
  }
}

//малюємо фігуру
function drawTetromino() {
  const { name, color, matrix } = tetromino;

  //проходимо по клітинках і малюємо фігуру
  for (let row = 0; row < matrix.length; row++) {
    for (let column = 0; column < matrix.length; column++) {
      if (tetromino.row + row < 0) {
        continue;
      }
      if (matrix[row][column] == 0) {
        continue;
      }

      const cellIndex = convertPositionToIndex(
        tetromino.row + row,
        tetromino.column + column
      );

      cells[cellIndex].classList.add(name);
      cells[cellIndex].style.background = color;
    }
  }
}
drawTetromino();

function draw() {
  cells.forEach(function (cell) {
    cell.removeAttribute("class");
    cell.removeAttribute("style");
  });

  drawPlayField();
  drawTetromino();
  console.table(playfield);
}

document.addEventListener("keydown", onKeyDown);

function onKeyDown(event) {
  switch (event.key) {
    case "ArrowUp":
      rotateTetromino();
      break;
    case "ArrowDown":
      moveTetrominoDown();
      break;
    case "ArrowLeft":
      moveTetrominoLeft();
      break;
    case "ArrowRight":
      moveTetrominoRight();
      break;
  }
  draw();
}

function moveTetrominoDown() {
  tetromino.row += 1;
  if (isValid()) {
    tetromino.row -= 1;
    placeTetromino();
  }
}
function moveTetrominoLeft() {
  tetromino.column -= 1;
  if (isValid()) {
    tetromino.column += 1;
  }
}

function moveTetrominoRight() {
  tetromino.column += 1;
  if (isValid()) {
    tetromino.column -= 1;
  }
}

function isValid() {
  const matrixSize = tetromino.matrix.length;

  for (let row = 0; row < matrixSize; row++) {
    for (let column = 0; column < matrixSize; column++) {
      if (!tetromino.matrix[row][column]) {
        continue;
      }
      if (isOutSideOfGameBoard(row, column, tetromino, playfield)) {
        return true;
      }
      if (hasCollisions(row, column, tetromino, playfield)) {
        return true;
      }
    }
  }
  return false;
}

////////////////////////////////////

function placeTetromino() {
  const matrixSize = tetromino.matrix.length;
  for (let row = 0; row < matrixSize; row++) {
    for (let column = 0; column < matrixSize; column++) {
      if (!tetromino.matrix[row][column]) continue;

      playfield[tetromino.row + row][tetromino.column + column] =
        tetromino.name;
    }
  }
  console.log(tetromino.name);
  const filledRows = findFilledRows();

  removeFillRows(filledRows);
  if (filledRows.length >= 1) {
    addScores(filledRows);
  }

  generateTetromino(randomFigure());
}

function moveDown() {
  moveTetrominoDown();
  draw();
  startLoop();
}

function startLoop() {
  timeoutId = setTimeout(
    () => (requestId = requestAnimationFrame(moveDown)),
    700
  );
}
startLoop();

function stopLoop() {
  cancelAnimationFrame(requestId);
  timeoutId = clearTimeout(timeoutId);
}

function rotateTetromino() {
  const oldMatrix = tetromino.matrix;
  const rotatedMatrix = rotateMatrix(tetromino.matrix);
  // array = rotateMatrix(tetromino.matrix);
  tetromino.matrix = rotatedMatrix;
  if (isValid()) {
    tetromino.matrix = oldMatrix;
  }
}

function rotateMatrix(matrixTetromino) {
  const N = matrixTetromino.length;
  const rotateMatrix = [];
  for (let i = 0; i < N; i++) {
    rotateMatrix[i] = [];
    for (let j = 0; j < N; j++) {
      rotateMatrix[i][j] = matrixTetromino[N - j - 1][i];
    }
  }
  return rotateMatrix;
}

function findFilledRows() {
  const filledRows = [];
  for (let row = 0; row < PLAYFIELD_ROWS; row++) {
    let fiilledColumns = 0;
    for (let column = 0; column < PLAYFIELD_COLUMNS; column++)
      if (playfield[row][column] != 0) {
        fiilledColumns++;
      }
    if (PLAYFIELD_COLUMNS == fiilledColumns) {
      filledRows.push(row);
    }
  }
  return filledRows;
}

function removeFillRows(filledRows) {
  filledRows.forEach((row) => {
    dropRowsAbove(row);
  });
}

function addScores(filledRows) {
  const filledRowsLength = filledRows.length;
  const playScore = Number(playScores[filledRowsLength]);
  scores += playScore;
  currentScore.textContent = scores;

  if (scores >= 20) {
    //Finish

    cells.forEach(function (cell) {
      cell.removeAttribute("class");
      cell.removeAttribute("style");
    });
  }
}

function dropRowsAbove(rowDelete) {
  for (let row = rowDelete; row > 0; row--) {
    playfield[row] = playfield[row - 1];
  }
  playfield[0] = new Array(PLAYFIELD_COLUMNS).fill(0);
}

btnNew.addEventListener("click", init);
