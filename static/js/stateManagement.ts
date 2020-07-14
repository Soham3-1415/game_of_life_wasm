export class StateManagement {
    private readonly pausePlay: HTMLButtonElement;
    private readonly step: HTMLButtonElement;
    private readonly playString: string;
    private readonly pauseString: string;
    private playing: boolean;

    constructor(pausePlay: HTMLButtonElement, step: HTMLButtonElement, playString: string, pauseString: string) {
        this.pausePlay = pausePlay;
        this.step = step;
        this.playString = playString;
        this.pauseString = pauseString;
        this.playing = false;
    }

    isPlaying(): boolean {
        return this.playing;
    }

    toggle_pause_play(): void {
        if (this.playing) {
            this.playing = false;
            this.pausePlay.innerHTML = this.playString;
            this.step.disabled = false;
        } else {
            this.playing = true;
            this.pausePlay.innerHTML = this.pauseString;
            this.step.disabled = true;
        }
    }
}