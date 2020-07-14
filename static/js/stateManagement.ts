export class StateManagement {
    private playing: boolean;

    constructor(private readonly pausePlay: HTMLButtonElement, private readonly step: HTMLButtonElement, private readonly playString: string, private readonly pauseString: string) {
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