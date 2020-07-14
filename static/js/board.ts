import {CellCollection, CellState, InitOutput} from './wasm/game_of_life_wasm.js';

export class InitialBoardState {
    private readonly rowPositions: number[];
    private readonly columnPositions: number[];
    private readonly rowOffset: number;
    private readonly columnOffset: number;

    constructor(rowPositions: number[], columnPositions: number[], rowOffset: number, columnOffset: number) {
        this.rowPositions = rowPositions;
        this.columnPositions = columnPositions;
        this.rowOffset = rowOffset;
        this.columnOffset = columnOffset;
    }

    static empty(): InitialBoardState {
        return new InitialBoardState([], [], 0, 0);
    }

    init(rustBoard: CellCollection): void {
        rustBoard.reset();
        for (let i = 0; i < this.rowPositions.length; i++) {
            rustBoard.activate_cell(this.rowPositions[i] + this.rowOffset, this.columnPositions[i] + this.columnOffset);
        }
    }
}

export class Board {
    private readonly memory: WebAssembly.Memory;

    private readonly rustBoard: CellCollection;
    private cells: Uint8Array;
    private readonly width: number;
    private readonly height: number;
    private readonly gridColor: string;
    private readonly deadColor: string;
    private readonly aliveColor: string;
    private readonly cellSize: number;
    private readonly canvasContext: CanvasRenderingContext2D;

    constructor(wasm: InitOutput, height: number, width: number, gridColor: string, deadColor: string, aliveColor: string, cellSize: number, canvasContext: CanvasRenderingContext2D) {
        this.memory = wasm.memory;

        this.width = width;
        this.height = height;

        this.rustBoard = CellCollection.new(this.height, this.width);
        this.cells = new Uint8Array(this.memory.buffer, this.rustBoard.cells(), this.width * this.height);

        this.gridColor = gridColor;
        this.deadColor = deadColor;
        this.aliveColor = aliveColor;

        this.cellSize = cellSize;
        this.canvasContext = canvasContext;
    }

    initBoard(state: InitialBoardState): void {
        state.init(this.rustBoard);
    }

    renderNextTick(): void {
        this.rustBoard.tick();
        this.drawUpdatedCells();
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

    canvasCellPathUpdate(row: number, column: number): void {
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

    drawAllCells(): void {
        this.canvasContext.beginPath();

        for (let row = 0; row < this.height; row++) {
            for (let column = 0; column < this.width; column++) {
                this.canvasCellPathUpdate(row, column);
            }
        }

        this.canvasContext.stroke();
    }

    drawUpdatedCells(): void {
        this.canvasContext.beginPath();

        const xPoses = this.toggle_x();
        const yPoses = this.toggle_y();
        for (let i = 0; i < xPoses.length; i++) {
            const row = xPoses[i];
            const column = yPoses[i];
            this.canvasCellPathUpdate(row, column);
        }

        this.canvasContext.stroke();
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