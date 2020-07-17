export class FPSMonitor {
    private lastTime: DOMHighResTimeStamp;
    private avgFPS: number;
    private cachedFPS: number;
    private staleIterations: number;

    readonly defaultFPS = 0;

    constructor(private readonly smoothingFactor: number, private readonly staleIterationThreshold: number) {
        this.lastTime = 0;
        this.avgFPS = this.defaultFPS;
        this.cachedFPS = this.avgFPS;
        this.staleIterations = 0;
    }

    addTime(time: DOMHighResTimeStamp): void {
        const fps = 1000 / (time - this.lastTime);
        this.avgFPS = fps * (1 - this.smoothingFactor) + this.avgFPS * this.smoothingFactor;
        this.lastTime = time;
    }

    getFPS(): number {
        if (this.staleIterations >= this.staleIterationThreshold) {
            this.staleIterations = 0;
            this.cachedFPS = this.avgFPS;
        }
        this.staleIterations += 1;

        return this.cachedFPS;
    }
}