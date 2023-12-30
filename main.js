import { TETROMINOES, figures } from "./js/data.js";
import {
  PLAYFIELD_COLUMNS,
  PLAYFIELD_ROWS,
  TETROMINO_NAMES,
  playScores,
} from "./js/config.js";

const btnRestart = document.querySelector(".btn");
const currentScore = document.querySelector(".current-score");
const yourScore = document.getElementById("score");
const bestScore = document.getElementById("high-score");
const message = document.querySelector(".message");
const mainBtn = document.querySelectorAll(".btn");
const image = document.querySelector(".img");

//створюємо змінні
let playfield,
  tetromino,
  nextTetro = randomFigure(),
  scores = 0,
  yourScores = 0,
  highScores = JSON.parse(localStorage.getItem("highScores")),
  timeoutId,
  requestId,
  cells,
  isPaused = false,
  isGameOver = false,
  playing = false;

init();

function init() {
  isGameOver = false;
  generatePlayfield();
  generateTetromino();
  startLoop();
  message.style.display = "none";
  cells = document.querySelectorAll(".tetris div");
  scores = 0;
  bestScore.innerText = highScores;
}

document.addEventListener("keydown", onKeyDown);
btnRestart.addEventListener("click", function () {
  init();
});

function randomFigure() {
  return TETROMINO_NAMES[random(0, TETROMINO_NAMES.length)];
}

function convertPositionToIndex(row, column) {
  return row * PLAYFIELD_COLUMNS + column;
}

function random(min, max) {
  const index = Math.floor(Math.random() * (max - min) + min);
  return index;
}

function randomColor(A = 1) {
  return `rgb(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, ${A})`;
}

mainBtn.forEach(function (btn) {
  btn.addEventListener("click", function () {
    let idName = btn.getAttribute("id");
    onKeyDown(idName);
  });
});

function generatePlayfield() {
  document.querySelector(".tetris").innerHTML = " ";
  for (let i = 0; i < PLAYFIELD_ROWS * PLAYFIELD_COLUMNS; i++) {
    const div = document.createElement("div");
    document.querySelector(".tetris").append(div);
  }

  playfield = new Array(PLAYFIELD_ROWS)
    .fill()
    .map(() => new Array(PLAYFIELD_COLUMNS).fill(0));
}

function generateTetromino() {
  const nameTetro = nextTetro;
  createNextFigure();

  const matrixTetro = TETROMINOES[nameTetro];

  const columnTetro = Math.floor(
    PLAYFIELD_COLUMNS / 2 - matrixTetro.length / 2
  );

  const rowTetro = -2;
  const colorTetro = randomColor();

  tetromino = {
    name: nameTetro,
    matrix: matrixTetro,
    row: rowTetro,
    column: columnTetro,
    color: colorTetro,
  };
}

function createNextFigure() {
  nextTetro = randomFigure();

  const result = figures.find(({ name }) => name === nextTetro);
  image.setAttribute("src", result.src);
}

function drawPlayField() {
  for (let row = 0; row < PLAYFIELD_ROWS; row++) {
    for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
      const name = playfield[row][column];

      const cellIndex = convertPositionToIndex(row, column);
      cells[cellIndex].classList.add(name);
    }
  }
}

function drawTetromino() {
  const name = tetromino.name;
  const color = tetromino.color;
  const tetrominoMatrixSize = tetromino.matrix.length;

  for (let row = 0; row < tetrominoMatrixSize; row++) {
    for (let column = 0; column < tetrominoMatrixSize; column++) {
      if (isOutsideTopGameBoard(row)) {
        continue;
      }
      if (tetromino.matrix[row][column] == 0) {
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

function isOutsideTopGameBoard(row) {
  return tetromino.row + row < 0;
}

function draw() {
  cells.forEach(function (cell) {
    cell.removeAttribute("class");
    cell.removeAttribute("style");
  });

  drawPlayField();
  drawTetromino();
}

function togglePausedGame() {
  isPaused = !isPaused;

  if (isPaused) {
    stopLoop();
  } else {
    startLoop();
  }
}

function onKeyDown(event) {
  if (event.key === "p" || event == "Pause") {
    togglePausedGame();
  }
  if (isPaused) {
    return;
  }
  switch (event.key || event) {
    case " ":
    case "DoubleArrowDown":
      dropTetrominoDown();
      break;
    case "ArrowUp":
    case "Rotate":
      rotateTetromino();
      break;
    case "ArrowDown":
    case "ArrowDown-btn":
      moveTetrominoDown();
      break;
    case "ArrowLeft":
    case "ArrowLeft-btn":
      moveTetrominoLeft();
      break;
    case "ArrowRight":
    case "ArrowRight-btn":
      moveTetrominoRight();
      break;
  }
  draw();
}

function dropTetrominoDown() {
  while (!isValid()) {
    tetromino.row++;
  }
  tetromino.row--;
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

      if (isOutSideOfGameBoard(row, column)) {
        return true;
      }
      if (hasCollisions(row, column)) {
        return true;
      }
    }
  }
  return false;
}

function isOutSideOfGameBoard(row, column) {
  return (
    tetromino.column + column < 0 ||
    tetromino.column + column >= PLAYFIELD_COLUMNS ||
    tetromino.row + row >= playfield.length
  );
}

function hasCollisions(row, column) {
  return playfield[tetromino.row + row]?.[tetromino.column + column];
}

function placeTetromino() {
  const matrixSize = tetromino.matrix.length;
  for (let row = 0; row < matrixSize; row++) {
    for (let column = 0; column < matrixSize; column++) {
      if (!tetromino.matrix[row][column]) continue;
      if (isOutsideTopGameBoard(row)) {
        isGameOver = true;
        return;
      }
      playfield[tetromino.row + row][tetromino.column + column] =
        tetromino.name;
    }
  }

  const filledRows = findFilledRows();

  removeFillRows(filledRows);
  if (filledRows.length >= 1) {
    addScores(filledRows);
  }
  generateTetromino();
}

function moveDown() {
  moveTetrominoDown();
  draw();
  stopLoop();
  startLoop();
  if (isGameOver) {
    gameOver();
  }
}

function gameOver() {
  stopLoop();
  yourScores = scores;
  yourScore.textContent = yourScores;
  currentScore.textContent = 0;
  checkHighScore();
  displayMessage("Game over 😞");
}

function checkHighScore() {
  if (scores > highScores) {
    localStorage.setItem("highScores", JSON.stringify(scores));
  }
}
console.log(highScores);
function startLoop() {
  timeoutId = setTimeout(
    () => (requestId = requestAnimationFrame(moveDown)),
    700
  );
}

function stopLoop() {
  cancelAnimationFrame(requestId);
  timeoutId = clearTimeout(timeoutId);
}

function rotateTetromino() {
  const oldMatrix = tetromino.matrix;
  const rotatedMatrix = rotateMatrix(tetromino.matrix);

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
}

function dropRowsAbove(rowDelete) {
  for (let row = rowDelete; row > 0; row--) {
    playfield[row] = playfield[row - 1];
  }
  playfield[0] = new Array(PLAYFIELD_COLUMNS).fill(0);
}

const displayMessage = function (alert) {
  message.textContent = alert;
  message.style.display = "flex";
};
