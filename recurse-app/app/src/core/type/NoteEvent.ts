export default class NoteEvent {
    public start: number;
    public duration: number;
    public pitch: number;
    public velocity: number;

    constructor(start: number, duration: number, pitch: number, velocity: number) {
        this.start = start;
        this.duration = duration;
        this.pitch = pitch;
        this.velocity = velocity;
    }
}