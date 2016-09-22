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

export function convertNoteListToRecurseCode(noteList: INote[], clipLength: number = 4): string {
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
        let totalLength = clipLength * 4;

        if (totalLength !== 16) {
            output += `length(${totalLength}) `;
        }

        let rmOutput = "";
        for (let i: number = 0; i < result.intervals.length; i++) {
            let interval = result.intervals[i];
            if (interval > 0) {
                rmOutput += interval;
            } else {
                interval = Math.abs(interval);
                rmOutput += `_${interval}`;
            }
            totalLength -= interval;
            if (i < result.intervals.length - 1) {
                rmOutput += ",";
            }
        }
        if (totalLength > 0) {
            rmOutput += `,_${totalLength}`;
        }
        output += `rm(${rmOutput}) `;

        let noteOutput = "";
        let noteValueStatic: number = -1; // if >= 0, note value is unchanged throughout the sequence and can be included only once in output. Otherwise note value changes and should be included as is.
        for (let i: number = 0; i < result.notes.length; i++) {
            let note: number = result.notes[i];
            if (noteValueStatic !== note) {
                if (noteValueStatic === -1) {
                    noteValueStatic = note;
                } else {
                    noteValueStatic = -2;
                }
            }
            noteOutput += Note.noteNames[note].toLowerCase() + (i < result.notes.length - 1 ? "," : "");
        }
        if (noteValueStatic >= 0) {
            noteOutput = Note.noteNames[noteValueStatic].toLowerCase();
        }
        output += `ns(${noteOutput})${(r < results.length - 1 ? "; " : "")}`;
    }

    return output;
}
