//Розміри ігрового поля
const PLAYFIELD_COLUMNS = 10;
const PLAYFIELD_ROWS = 20;

//перелік фігур
const TETROMINO_NAMES = ["O", "L", "I", "S", "Z", "J", "T"];

//малюнок фігур
const TETROMINOES = {
  O: [
    [1, 1],
    [1, 1],
  ],
  L: [
    [1, 0, 0],
    [1, 0, 0],
    [1, 1, 0],
  ],
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [0, 0, 1],
    [0, 0, 1],
    [0, 1, 1],
  ],
  T: [
    [1, 1, 1],
    [0, 1, 0],
    [0, 0, 0],
  ],
};

//наступна фігура
const figures = [
  {
    name: "O",
    src: "./image/svg/tetris-O.svg",
  },
  {
    name: "L",
    src: "./image/svg/tetris-L.svg",
  },
  {
    name: "I",
    src: "./image/svg/tetris-I.svg",
  },
  {
    name: "S",
    src: "./image/svg/tetris-S.svg",
  },
  {
    name: "Z",
    src: "./image/svg/tetris-Z.svg",
  },
  {
    name: "J",
    src: "./image/svg/tetris-J.svg",
  },
  {
    name: "T",
    src: "./image/svg/tetris-T.svg",
  },
];

const playScores = { 1: 10, 2: 20, 3: 30, 4: 40 };

const btnRestart = document.querySelector(".btn");
const currentScore = document.querySelector(".current-score");
const yourScore = document.getElementById("score");
const bestScore = document.getElementById("high-score");
const gameOverBlock = document.querySelector(".opacity");
const message = document.querySelector(".message");
const btnUp = document.getElementById("ArrowUp");
const btnLeft = document.getElementById("ArrowLeft");
const btnRight = document.getElementById("ArrowRight");
const btnDown = document.getElementById("ArrowDown");
const btnP = document.getElementById("Pause");
const btnDrop = document.getElementById("DoubleArrowDown");
const image = document.querySelector(".img");

//створюємо змінні
let playfield,
  tetromino,
  nextTetro = randomFigure(),
  scores = 0,
  yourScores = JSON.parse(localStorage.getItem("previousScores")),
  // yourScores = 0,
  highScores = JSON.parse(localStorage.getItem("highScores")),
  timeoutId,
  requestId,
  cells,
  isPaused = false,
  isGameOver = false,
  playing = false;

init();

function init() {
  // gameOverBlock.style.display = "none";

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

//функція конвертація індексів
function convertPositionToIndex(row, column) {
  return row * PLAYFIELD_COLUMNS + column;
}

function random(min, max) {
  const index = Math.floor(Math.random() * (max - min) + min);
  return index;
}

//cтворення кольорів
function randomColor(A = 1) {
  return `rgb(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, ${A})`;
}

//створення ігрового поля
function generatePlayfield() {
  document.querySelector(".tetris").innerHTML = " ";
  //створюємо діви, квадратика поля, це як наш фон
  for (let i = 0; i < PLAYFIELD_ROWS * PLAYFIELD_COLUMNS; i++) {
    const div = document.createElement("div");
    document.querySelector(".tetris").append(div);
  }
  //створюємо матрицю, заповнюємо поле нулями, так як наші фігури це одинички
  playfield = new Array(PLAYFIELD_ROWS)
    .fill()
    .map(() => new Array(PLAYFIELD_COLUMNS).fill(0));
}

//опис де і яка фігура має зявитись
function generateTetromino() {
  const nameTetro = nextTetro;
  createNextFigure();

  //матриця фігури, напри2х2, чи3х3
  const matrixTetro = TETROMINOES[nameTetro];

  //де має зявитись фігура
  //центруємо фігуру
  const columnTetro = Math.floor(
    PLAYFIELD_COLUMNS / 2 - matrixTetro.length / 2
  );

  const rowTetro = -2;
  const colorTetro = randomColor();
  //сама фігура, назва, де має знаходитись-зявлятись, скільки клітинок займає
  tetromino = {
    name: nameTetro,
    matrix: matrixTetro,
    row: rowTetro,
    column: columnTetro,
    color: colorTetro,
  };
}

// створення наступної фігури
function createNextFigure() {
  nextTetro = randomFigure();

  const result = figures.find(({ name }) => name === nextTetro);
  image.setAttribute("src", result.src);
}

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
  const name = tetromino.name;
  const color = tetromino.color;
  const tetrominoMatrixSize = tetromino.matrix.length;

  //проходимо по клітинках і малюємо фігуру
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

// drawTetromino();

function isOutsideTopGameBoard(row) {
  return tetromino.row + row < 0;
}

//заставляємо фігуру рухатись
function draw() {
  //проходимо по ячейкам і видаляємо класи
  cells.forEach(function (cell) {
    cell.removeAttribute("class");
    cell.removeAttribute("style");
  });
  //малюємо поле
  drawPlayField();
  //малюємо фігуру
  drawTetromino();
  // console.table(playfield);
}

//робимо перемикання клавіатури

function togglePausedGame() {
  isPaused = !isPaused;

  if (isPaused) {
    stopLoop();
  } else {
    startLoop();
  }
}

// function startGame() {
//   playing = !playing;
//   if (playing) {
//     init();
//   }
// }

function onKeyDown(event) {
  if (event.key === "p") {
    togglePausedGame();
  }
  if (event.key === "Escape") {
    startGame();
  }
  if (isPaused || playing) {
    return;
  }
  switch (event.key) {
    // case "Escape":
    //   init();
    //   break;
    case " ":
      dropTetrominoDown();
      break;
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

function dropTetrominoDown() {
  while (!isValid()) {
    //падає до низу
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

//забираємо дублювання функції
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

//ФУНКЦІЯ на перевірку чи виходить за поле чи ні
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

///////////////////////////
//появлення нової фігури
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
  // gameOverBlock.style.display = "flex";
}

function checkHighScore() {
  if (scores > highScores) {
    // bestScore.textContent = highScores;
    localStorage.setItem("highScores", JSON.stringify(scores));
    // } else {
    //   highScores;
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
//формула перегортання
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

//видаляємо заповненні лінії

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

btnUp.addEventListener("click", function () {
  rotateTetromino();
});
btnLeft.addEventListener("click", function () {
  moveTetrominoLeft();
});
btnRight.addEventListener("click", function () {
  moveTetrominoRight();
});
btnDown.addEventListener("click", function () {
  moveTetrominoDown();
});
btnP.addEventListener("click", function () {
  togglePausedGame();
});
btnDrop.addEventListener("click", function () {
  dropTetrominoDown();
});
