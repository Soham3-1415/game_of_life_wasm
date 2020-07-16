import {InitialBoardState} from './board.js';

export const CELL_SIZE: number = 5; // px

const controls = document.getElementById('controls');
export const WIDTH: number = Math.floor(controls.clientWidth / (CELL_SIZE + 1)); // cells
export const HEIGHT: number = Math.floor((window.innerHeight - controls.clientHeight) / (CELL_SIZE + 1 + 1 /*Why the extra 1? I don't know, but it seems to work well enough.*/)); // cells

export const GRID_COLOR: string = '#343a40';
export const DEAD_COLOR: string = '#f8f9fa';
export const ALIVE_COLOR: string = '#17a2b8';

export const PLAY_STRING: string = '<i class="material-icons">play_arrow</i> Play';
export const PAUSE_STRING: string = '<i class="material-icons">pause</i> Pause';

export const FPS_SMOOTHING_FACTOR: number = .95;
export const STALE_ITERATION_THRESHOLD: number = 12;


const GLIDER_ROW_POSITIONS: number[] = [0, 1, 2, 2, 1];
const GLIDER_COLUMN_POSITIONS: number[] = [2, 2, 2, 1, 0];
const GLIDER_ROW_OFFSET: number = 4;
const GLIDER_COLUMN_OFFSET: number = 4;
const GLIDER: InitialBoardState = new InitialBoardState(GLIDER_ROW_POSITIONS, GLIDER_COLUMN_POSITIONS, GLIDER_ROW_OFFSET, GLIDER_COLUMN_OFFSET);

const ACORN_ROW_POSITIONS: number[] = [2, 2, 0, 1, 2, 2, 2];
const ACORN_COLUMN_POSITIONS: number[] = [0, 1, 1, 3, 4, 5, 6];
const ACORN_ROW_OFFSET: number = (HEIGHT - ACORN_ROW_POSITIONS.length) / 2;
const ACORN_COLUMN_OFFSET: number = (WIDTH - ACORN_COLUMN_POSITIONS.length) / 2;
const ACORN: InitialBoardState = new InitialBoardState(ACORN_ROW_POSITIONS, ACORN_COLUMN_POSITIONS, ACORN_ROW_OFFSET, ACORN_COLUMN_OFFSET);

const PULSAR_ROW_POSITIONS: number[] = [0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 7, 7, 7, 7, 7, 7, 12, 12, 12, 12, 12, 12, 2, 3, 4, 8, 9, 10, 2, 3, 4, 8, 9, 10, 2, 3, 4, 8, 9, 10, 2, 3, 4, 8, 9, 10];
const PULSAR_COLUMN_POSITIONS: number[] = [2, 3, 4, 8, 9, 10, 2, 3, 4, 8, 9, 10, 2, 3, 4, 8, 9, 10, 2, 3, 4, 8, 9, 10, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 7, 7, 7, 7, 7, 7, 12, 12, 12, 12, 12, 12];
const PULSAR_ROW_OFFSET: number = (HEIGHT - PULSAR_ROW_POSITIONS.length) / 2;
const PULSAR_COLUMN_OFFSET: number = (WIDTH - PULSAR_COLUMN_POSITIONS.length) / 2;
const PULSAR: InitialBoardState = new InitialBoardState(PULSAR_ROW_POSITIONS, PULSAR_COLUMN_POSITIONS, PULSAR_ROW_OFFSET, PULSAR_COLUMN_OFFSET);

const RPENTOMINO_ROW_POSITIONS: number[] = [1, 0, 1, 2, 0];
const RPENTOMINO_COLUMN_POSITIONS: number[] = [0, 1, 1, 1, 2];
const RPENTOMINO_ROW_OFFSET: number = (HEIGHT - RPENTOMINO_ROW_POSITIONS.length) / 2;
const RPENTOMINO_COLUMN_OFFSET: number = (WIDTH - RPENTOMINO_COLUMN_POSITIONS.length) / 2;
const RPENTOMINO: InitialBoardState = new InitialBoardState(RPENTOMINO_ROW_POSITIONS, RPENTOMINO_COLUMN_POSITIONS, RPENTOMINO_ROW_OFFSET, RPENTOMINO_COLUMN_OFFSET);

const GOSPER_GLIDER_GUN_ROW_POSITIONS: number[] = [0, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 7, 7, 8, 8];
const GOSPER_GLIDER_GUN_COLUMN_POSITIONS: number[] = [24, 22, 24, 12, 13, 20, 21, 34, 35, 11, 15, 20, 21, 34, 35, 0, 1, 10, 16, 20, 21, 0, 1, 10, 14, 16, 17, 22, 24, 10, 16, 24, 11, 15, 12, 13];
const GOSPER_GLIDER_GUN_ROW_OFFSET: number = 4;
const GOSPER_GLIDER_GUN_COLUMN_OFFSET: number = 4;
const GOSPER_GLIDER_GUN: InitialBoardState = new InitialBoardState(GOSPER_GLIDER_GUN_ROW_POSITIONS, GOSPER_GLIDER_GUN_COLUMN_POSITIONS, GOSPER_GLIDER_GUN_ROW_OFFSET, GOSPER_GLIDER_GUN_COLUMN_OFFSET);

const EMPTY_BOARD: InitialBoardState = InitialBoardState.empty();

export const BOARD_INIT_STATES = {
    "#glider": GLIDER,
    "#acorn": ACORN,
    "#pulsar": PULSAR,
    "#r-pentomino": RPENTOMINO,
    "#gosper-glider-gun": GOSPER_GLIDER_GUN,
    "#reset": EMPTY_BOARD,
};

export const DEFAULT_BOARD_STATE: InitialBoardState = GLIDER;