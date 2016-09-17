// Intended for use in the recurse connector M4L plugin. Implemented here for easy testing via Tape.

import Note from "../type/Note";
interface INote {
    start: number;
    duration: number;
    pitch: number;
    velocity: number;
    muted: number;
}

interface IResult {
    intervals: number[];
    notes: number[];
}

export function convertNoteListToRecurseCode(noteList: INote[]): string {
    var results: IResult[] = [{intervals: [], notes: []}],
        currentResultIndex: number = 0,
        currentStartPos: number,
        currentEndPos: number,
        backlog: INote[],
        output: string = "";

    do {
        backlog = [];
        currentEndPos = currentStartPos = 0;
        for (let note of noteList) {
            if (!results[currentResultIndex]) {
                results[currentResultIndex] = {intervals: [], notes: []};
            }
            let currentResults = results[currentResultIndex];
            if (currentEndPos <= note.start) {
                if (currentEndPos < note.start) {
                    currentResults.intervals.push(0 - ((note.start - currentEndPos) * 4)); // negative signifies blank intervals
                }
                currentResults.intervals.push(note.duration * 4);
                currentResults.notes.push(note.pitch);
                currentStartPos = note.start;
                currentEndPos = note.start + note.duration;
            } else {
                backlog.push(note);
            }
        }
        noteList = backlog;
        currentResultIndex++;
    } while (backlog.length !== 0);

    for (let r: number = 0; r < results.length; r++) {
        let result = results[r];

        output += "rm(";
        for (let i: number = 0; i < result.intervals.length; i++) {
            let interval = result.intervals[i];
            output += (interval > 0 ? interval : "_" + Math.abs(interval)) + (i < result.intervals.length - 1 ? "," : "");
        }
        output += ") ";

        output += "ns(";
        for (let i: number = 0; i < result.notes.length; i++) {
            let note = result.notes[i];
            output += Note.noteNames[note].toLowerCase() + (i < result.notes.length - 1 ? "," : "");
        }
        output += ")" + (r < results.length - 1 ? "; " : "");
    }

    return output;
}