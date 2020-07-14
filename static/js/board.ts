import {CellCollection, CellState} from './wasm/game_of_life_wasm.js';

export class InitialBoardState {
    constructor(private readonly rowPositions: number[], private readonly columnPositions: number[], private readonly rowOffset: number, private readonly columnOffset: number) {
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
    private readonly rustBoard: CellCollection;
    private cells: Uint8Array;
    private paintCellState: CellState;

    constructor(
        private readonly memory: WebAssembly.Memory,
        private readonly height: number,
        private readonly width: number,
        private readonly gridColor: string,
        private readonly deadColor: string,
        private readonly aliveColor: string,
        private readonly cellSize: number,
        private readonly canvasContext: CanvasRenderingContext2D
    ) {
        this.rustBoard = CellCollection.new(this.height, this.width);
        this.cells = new Uint8Array(this.memory.buffer, this.rustBoard.cells(), this.width * this.height);
        this.paintCellState = null;
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

    private canvasCellPathUpdate(row: number, column: number): void {
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

    immediateCellSet(row: number, column: number): void {
        if (this.paintCellState !== null) {
            this.rustBoard.write_cell_state(row, column, this.paintCellState);
            this.canvasContext.beginPath();
            this.canvasCellPathUpdate(row, column);
            this.canvasContext.stroke();
        }
    }

    setPaintCellState(row: number, column: number): void {
        this.paintCellState = this.rustBoard.read_cell_state(row, column) === CellState.ALIVE ? CellState.DEAD : CellState.ALIVE;
        this.immediateCellSet(row, column);
    }

    unsetPaintCellState(): void {
        this.paintCellState = null;
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