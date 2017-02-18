import {NoteEvent} from "../core/type/NoteEvent";

export interface IClip {
    notes: NoteEvent[];
    loopLength: number;
}