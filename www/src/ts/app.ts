import * as wasm from 'game_of_life_wasm';
import {memory} from 'game_of_life_wasm/game_of_life_wasm_bg';
import {Board} from './board';
import {StateManagement} from './stateManagement';
import {FPSMonitor} from './fPSMonitor';
import {
    ALIVE_COLOR,
    BOARD_INIT_STATES,
    CELL_SIZE,
    DEAD_COLOR,
    DEFAULT_BOARD_STATE,
    FPS_SMOOTHING_FACTOR,
    GRID_COLOR,
    HEIGHT,
    PAUSE_STRING,
    PLAY_STRING,
    STALE_ITERATION_THRESHOLD,
    WIDTH,
} from './boardinfo';

let jsBoard;

const pausePlayBtn = document.getElementById('pausePlayBtn') as HTMLButtonElement;
const stepBtn = document.getElementById('stepBtn') as HTMLButtonElement;
const stateBtnManager = new StateManagement(pausePlayBtn, stepBtn, PLAY_STRING, PAUSE_STRING);
const speedRange = document.getElementById('speedRange') as HTMLInputElement;
const framerate = document.getElementById('framerate') as HTMLSpanElement;
const fpsMonitor = new FPSMonitor(FPS_SMOOTHING_FACTOR, STALE_ITERATION_THRESHOLD);
const gameCanvas = document.getElementById('game-canvas') as HTMLCanvasElement;
gameCanvas.height = (CELL_SIZE + 1) * HEIGHT + 1;
gameCanvas.width = (CELL_SIZE + 1) * WIDTH + 1;

const canvasContext = gameCanvas.getContext('2d');

function getTimeThreshold(rangeValue: number): DOMHighResTimeStamp {
    return 500 - rangeValue * 5;
}

let animationFrame: number = 0;
let lastFrame: DOMHighResTimeStamp = 0;
let timeThreshold: number = getTimeThreshold(parseInt(speedRange.value));
const renderLoop: FrameRequestCallback = (timestamp: DOMHighResTimeStamp): void => {
    if (timestamp - lastFrame >= timeThreshold) {
        lastFrame = timestamp;
        jsBoard.renderNextTick();
    }

    fpsMonitor.addTime(performance.now());
    framerate.textContent = fpsMonitor.getFPS().toPrecision(2);

    animationFrame = requestAnimationFrame(renderLoop);
};

const initBoard = (): void => {
    let state = BOARD_INIT_STATES[location.hash];
    if (state === undefined) {
        state = DEFAULT_BOARD_STATE;
    }
    jsBoard.initBoard(state);
    jsBoard.drawAllCells();

    gameCanvas.onmousedown = gameCanvasOnmousedown;
    gameCanvas.onmousemove = gameCanvasOnmousemove;
    window.onmouseup = windowOnmouseup;
    window.onhashchange = initBoard;
    pausePlayBtn.onclick = pausePlayBtnOnClick;
    stepBtn.onclick = stepBtnOnClick;
    speedRange.oninput = speedRangeOnInput;
};

const getMouseEventColumn = (event: MouseEvent): number => {
    const boundingRect = gameCanvas.getBoundingClientRect();
    const scaleX = gameCanvas.width / boundingRect.width;
    const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
    return Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), WIDTH - 1);
};

const getMouseEventRow = (event: MouseEvent): number => {
    const boundingRect = gameCanvas.getBoundingClientRect();
    const scaleY = gameCanvas.height / boundingRect.height;
    const canvasTop = (event.clientY - boundingRect.top) * scaleY;
    return Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), HEIGHT - 1);
};

let paintCellState: wasm.CellState = null;

const gameCanvasOnmousedown = (event: MouseEvent): void => {
    const row = getMouseEventRow(event);
    const column = getMouseEventColumn(event);

    jsBoard.setPaintCellState(row, column);
};

const gameCanvasOnmousemove = (event: MouseEvent): void => {
    if (paintCellState === null) {
        const row = getMouseEventRow(event);
        const column = getMouseEventColumn(event);

        jsBoard.immediateCellSet(row, column);
    }
};

const windowOnmouseup = (): void => {
    jsBoard.unsetPaintCellState();
};

const pausePlayBtnOnClick = (): void => {
    if (stateBtnManager.isPlaying()) {
        cancelAnimationFrame(animationFrame);
    } else {
        animationFrame = requestAnimationFrame(renderLoop);
    }

    stateBtnManager.toggle_pause_play();
};

const stepBtnOnClick = (): void => {
    jsBoard.renderNextTick();
};

const speedRangeOnInput = (): void => {
    timeThreshold = getTimeThreshold(parseInt(speedRange.value));
};

jsBoard = new Board(memory, HEIGHT, WIDTH, GRID_COLOR, DEAD_COLOR, ALIVE_COLOR, CELL_SIZE, canvasContext);
jsBoard.drawGrid();
initBoard();