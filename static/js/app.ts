import init from './wasm/game_of_life_wasm.js';
import {Board} from "./board.js";
import {StateManagement} from "./stateManagement.js";

let jsBoard;

const CELL_SIZE: number = 8; // px
const WIDTH: number = 128; // cells
const HEIGHT: number = 64; // cells
const GRID_COLOR: string = '#343a40';
const DEAD_COLOR: string = '#f8f9fa';
const ALIVE_COLOR: string = '#17a2b8';
const PLAY_STRING: string = '▶ Play';
const PAUSE_STRING: string = '⏸️ Pause';

const pausePlayBtn = document.getElementById('pausePlayBtn') as HTMLButtonElement;
const stepBtn = document.getElementById('stepBtn') as HTMLButtonElement;
const stateBtnManager = new StateManagement(pausePlayBtn, stepBtn, PLAY_STRING, PAUSE_STRING);
const speedRange = document.getElementById('speedRange') as HTMLInputElement;
const framerate = document.getElementById('framerate') as HTMLSpanElement;
const gameCanvas = document.getElementById('game-canvas') as HTMLCanvasElement;
gameCanvas.height = (CELL_SIZE + 1) * HEIGHT + 1;
gameCanvas.width = (CELL_SIZE + 1) * WIDTH + 1;

const canvasContext = gameCanvas.getContext('2d');

let animationFrame: number = 0;
let lastFrame: DOMHighResTimeStamp = 0;
let timeThreshold: number = 0;
const renderLoop: FrameRequestCallback = (timestamp: DOMHighResTimeStamp): void => {
    if (timestamp - lastFrame >= timeThreshold) {
        lastFrame = timestamp;
        jsBoard.renderNextTick();
    }

    animationFrame = requestAnimationFrame(renderLoop);
};

const run = async (): Promise<void> => {
    const wasm = await init();

    jsBoard = new Board(wasm, HEIGHT, WIDTH, GRID_COLOR, DEAD_COLOR, ALIVE_COLOR, CELL_SIZE, canvasContext);
    jsBoard.drawGrid();
    jsBoard.drawAllCells();
};

const pausePlayToggle = (): void => {
    if (stateBtnManager.isPlaying()) {
        cancelAnimationFrame(animationFrame);
    } else {
        animationFrame = requestAnimationFrame(renderLoop);
    }

    stateBtnManager.toggle_pause_play();
};

const stepTick = (): void => {
    jsBoard.renderNextTick();
}

const rangeUpdate = (): void => {
    timeThreshold = 500 - parseInt(speedRange.value) * 5;
};


pausePlayBtn.onclick = pausePlayToggle;
stepBtn.onclick = stepTick;
speedRange.oninput = rangeUpdate;

run().catch(() => console.log('Error running app.'));