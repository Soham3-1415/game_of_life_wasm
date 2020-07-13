import init, {CellCollection} from './wasm/game_of_life_wasm.js';
import {Board} from "./board.js";

const CELL_SIZE: number = 8; // px
const WIDTH: number = 64; // cells
const HEIGHT: number = 64; // cells
const GRID_COLOR: string = '#343a40';
const DEAD_COLOR: string = '#f8f9fa';
const ALIVE_COLOR: string = '#17a2b8';
const PLAY_STRING: string = '▶ Play';
const PAUSE_STRING: string = '⏸️ Pause';

const stateBtn = document.getElementById('stateBtn') as HTMLButtonElement;
const speedRange = document.getElementById('speedRange') as HTMLInputElement;
const gameCanvas = document.getElementById('game-canvas') as HTMLCanvasElement;
gameCanvas.height = (CELL_SIZE + 1) * HEIGHT + 1;
gameCanvas.width = (CELL_SIZE + 1) * WIDTH + 1;

const canvasContext = gameCanvas.getContext('2d');


const renderLoop: FrameRequestCallback = (): void => {


    requestAnimationFrame(renderLoop);
};

const run = async (): Promise<void> => {
    const wasm = await init();

    const rustBoard = CellCollection.new(HEIGHT, WIDTH);
    const jsBoard = new Board(wasm, HEIGHT, WIDTH, rustBoard, GRID_COLOR, DEAD_COLOR, ALIVE_COLOR, CELL_SIZE, canvasContext);
    jsBoard.drawGrid();
    jsBoard.drawAllCells();

    requestAnimationFrame(renderLoop);
};


const stateChange = (): void => {

};

const rangeUpdate = (): void => {

};


stateBtn.onclick = stateChange;
speedRange.oninput = rangeUpdate;

run().catch(() => console.log('Error running app.'));