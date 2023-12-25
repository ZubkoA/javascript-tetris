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
    [1, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
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
//створюємо змінні
let playfield; //поле
let tetromino; //малювання фігури

//функція конвертація індексів
function convertPositionToIndex(row, column) {
  return row * PLAYFIELD_COLUMNS + column;
}
//рандомна функція
////////////////////////////////////////
// function getRandomElement(arr) {
//   const randomIndex = Math.floor(Math.random() * arr.length);
//   return randomIndex;
// }
//////////////////////////////////////
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
  const nameTetro = TETROMINO_NAMES.at(random(0, TETROMINO_NAMES.length));

  //матриця фігури, напри2х2, чи3х3
  const matrixTetro = TETROMINOES[nameTetro];

  //де має зявитись фігура
  //центруємо фігуру
  const columnTetro = Math.floor(
    PLAYFIELD_COLUMNS / 2 - matrixTetro.length / 2
  );
  const rowTetro = 3;
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
generatePlayfield();
generateTetromino();

const cells = document.querySelectorAll(".tetris div");

// малюємо поле
function drawPlayField() {
  for (let row = 0; row < PLAYFIELD_ROWS; row++) {
    for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
      const name = playfield[row][column];
      console.log(name);
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
drawTetromino();

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
  console.table(playfield);
}

//робимо перемикання клавіатури
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

//забираємо дуюлювання функції
function isValid() {
  const matrixSize = tetromino.matrix.length;

  for (let row = 0; row < matrixSize; row++) {
    for (let column = 0; column < matrixSize; column++) {
      if (!tetromino.matrix[row][column]) {
        continue;
      }
      // if (tetromino.matrix[row][column] == 0) {
      //   continue;
      // }
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

//lesson2//////////////////
//робимо функцію щоб фігури не накладались одна на одну
function hasCollisions(row, column) {
  return playfield[tetromino.row + row][tetromino.column + column];
}
///////////////////////////
//появлення нової фігури
function placeTetromino() {
  const matrixSize = tetromino.matrix.length;
  for (let row = 0; row < matrixSize; row++) {
    for (let column = 0; column < matrixSize; column++) {
      if (!tetromino.matrix[row][column]) continue;

      playfield[tetromino.row + row][tetromino.column + column] =
        tetromino.name;
    }
  }
  const filledRows = findFilledRows();
  console.log(filledRows);
  removeFillRows(filledRows);
  generateTetromino();
}

//lesson 2 /////////////////////
//перегортання фігур
//перемалювання
// let array = [
//   [1, 2, 3],
//   [4, 5, 6],
//   [7, 8, 9],
// ];
function rotateTetromino() {
  const oldMatrix = tetromino.matrix;
  const rotatedMatrix = rotateMatrix(tetromino.matrix);
  // array = rotateMatrix(tetromino.matrix);
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

function dropRowsAbove(rowDelete) {
  for (let row = rowDelete; row > 0; row--) {
    playfield[row] = playfield[row - 1];
  }
  playfield[0] = new Array(PLAYFIELD_COLUMNS).fill(0);
}
//////////////////////////////

//ДЗ №2
// 1. поставити rowTetro -2. Зробити щоб працювало
//2. Поле для розрахунку балів
//3. Прописати логіку і код розрахунку балів (1ряд = 10, 2ряди = 30, 3ряди=50, 4ряди=100)
//4. реалізація руху фігур
