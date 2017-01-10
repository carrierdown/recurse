// Intended for use in the recurse connector M4L plugin. Implemented here for easy testing via Tape.

import Note from "../type/Note";
import {Constants} from "../type/Constants";
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
    velocities: number[];
}

const enum ConversionStrategy {
    compact,
    drum
}

// Note: This code could be split up a bit more, but I'm keeping everything in one function here since it's targeted as a single function in a M4L patch
export function convertNoteListToRecurseCode(noteList: INote[], clipLength: number = 16, strategy: ConversionStrategy = ConversionStrategy.compact): string {
    var results: IResult[] = [{intervals: [], notes: [], velocities: []}],
        currentResultIndex: number = 0,
        currentStartPos: number,
        currentEndPos: number,
        backlog: INote[],
        output: string = "",
        velocitiesNeeded = false;

    noteList.sort((a: INote, b: INote): number => {
        if (a.start > b.start) {
            return 1;
        }
        if (a.start < b.start) {
            return -1;
        }
        return 0;
    });

    do {
        backlog = [];
        currentEndPos = currentStartPos = 0;
        let currentPitch = noteList[0].pitch;

        for (let note of noteList) {
            if (!results[currentResultIndex]) {
                results[currentResultIndex] = {intervals: [], notes: [], velocities: []};
            }
            let currentResults = results[currentResultIndex];
            if (currentEndPos <= note.start && (note.pitch === currentPitch || strategy === ConversionStrategy.compact)) {
                if (currentEndPos < note.start) {
                    currentResults.intervals.push(0 - ((note.start - currentEndPos) * 4)); // negative signifies blank intervals
                }
                currentResults.intervals.push(note.duration * 4);
                currentResults.notes.push(note.pitch);
                currentResults.velocities.push(note.velocity);
                if (note.velocity !== 127 && !velocitiesNeeded) {
                    velocitiesNeeded = true;
                }
                currentStartPos = note.start;
                currentEndPos = note.start + note.duration;
            } else {
                backlog.push(note);
            }
        }
        noteList = backlog;
        currentResultIndex++;
    } while (backlog.length !== 0);

    // returns 1-element array with value if all values are equal, otherwise the unmodified array
    var compactArray = (elements: any[]): any[] => {
        if (elements.length < 2) {
            return elements;
        }
        for (let i = 1; i < elements.length; i++) {
            if (elements[i - 1] !== elements[i]) {
                return elements;
            }
        }
        return [elements[0]];
    };

    for (let r: number = 0; r < results.length; r++) {
        let result = results[r];
        result.intervals = compactArray(result.intervals);
        result.velocities = compactArray(result.velocities);
        result.notes = compactArray(result.notes);

        let totalLength = clipLength * 4;

        if (totalLength !== Constants.DEFAULT_PATTERN_LENGTH) {
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
                rmOutput += " ";
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
            noteOutput += Note.noteNames[note].toLowerCase() + (i < result.notes.length - 1 ? " " : "");
        }
        if (noteValueStatic >= 0) {
            noteOutput = Note.noteNames[noteValueStatic].toLowerCase();
        }
        output += `ns(${noteOutput})`;

        if (velocitiesNeeded) {
            let velOutput = "";
            for (let i: number = 0; i < result.velocities.length; i++) {
                let velocity: number = result.velocities[i];
                velOutput += `${velocity}${(i < result.velocities.length - 1 ? " " : "")}`;
            }
            output += ` vel(${velOutput})`;
        }

        output += `${(r < results.length - 1 ? ";\n" : "")}`;
    }

    return output;
}
