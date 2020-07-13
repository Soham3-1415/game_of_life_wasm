import {CellCollection, CellState, InitOutput} from './wasm/game_of_life_wasm.js';

export class Board {
    private readonly memory: WebAssembly.Memory;

    private rustBoard: CellCollection;
    private cells: Uint8Array;
    private readonly width: number;
    private readonly height: number;
    private readonly gridColor: string;
    private readonly deadColor: string;
    private readonly aliveColor: string;
    private readonly cellSize: number;
    private readonly canvasContext: CanvasRenderingContext2D;

    constructor(wasm: InitOutput, height: number, width: number, gameBoard: CellCollection, gridColor: string, deadColor: string, aliveColor: string, cellSize: number, canvasContext: CanvasRenderingContext2D) {
        this.memory = wasm.memory;

        this.width = width;
        this.height = height;

        this.rustBoard = gameBoard;
        this.cells = new Uint8Array(this.memory.buffer, this.rustBoard.cells(), this.width * this.height);

        this.gridColor = gridColor;
        this.deadColor = deadColor;
        this.aliveColor = aliveColor;

        this.cellSize = cellSize;
        this.canvasContext = canvasContext;
    }

    private toggle_x(): Uint16Array {
        const ptr = this.rustBoard.toggle_x();
        const updates = this.rustBoard.toggle_updates();

        return new Uint16Array(this.memory.buffer, ptr, updates);
    }

    private toggle_y(): Uint16Array {
        const ptr = this.rustBoard.toggle_y();
        const updates = this.rustBoard.toggle_updates();

        return new Uint16Array(this.memory.buffer, ptr, updates);
    }

    drawAllCells(): void {
        this.canvasContext.beginPath();

        for (let row = 0; row < this.height; row++) {
            for (let column = 0; column < this.height; column++) {
                let state: CellState = this.rustBoard.read_cell_state(row, column);

                this.canvasContext.fillStyle = state === CellState.DEAD
                    ? this.deadColor
                    : this.aliveColor;

                this.canvasContext.fillRect(
                    column * (this.cellSize + 1) + 1,
                    row * (this.cellSize + 1) + 1,
                    this.cellSize,
                    this.cellSize
                );
            }
        }

        this.canvasContext.stroke();
    }

    drawUpdatedCells(): void {

    }

    drawGrid(): void {
        this.canvasContext.beginPath();
        this.canvasContext.strokeStyle = this.gridColor;

        // Vertical lines.
        for (let i = 0; i <= this.width; i++) {
            this.canvasContext.moveTo(i * (this.cellSize + 1) + 1, 0);
            this.canvasContext.lineTo(i * (this.cellSize + 1) + 1, (this.cellSize + 1) * this.height + 1);
        }

        // Horizontal lines.
        for (let j = 0; j <= this.height; j++) {
            this.canvasContext.moveTo(0, j * (this.cellSize + 1) + 1);
            this.canvasContext.lineTo((this.cellSize + 1) * this.width + 1, j * (this.cellSize + 1) + 1);
        }

        this.canvasContext.stroke();
    }
}