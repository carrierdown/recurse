import tape = require('tape');

import {convertNoteListToRecurseCode} from "./convertNoteListToRecurseCode";

tape('convert overlapping notes to separate recurse declarations', (test) => {
    var testInput: {start: number, duration: number, pitch: number, velocity: number, muted: number}[] = [
            {
                start: 1,
                duration: 1,
                pitch: 60,
                velocity: 127,
                muted: 0
            },
            {
                start: 2,
                duration: 4,
                pitch: 60,
                velocity: 127,
                muted: 0
            },
            {
                start: 3,
                duration: 1,
                pitch: 60,
                velocity: 127,
                muted: 0
            },
            {
                start: 6,
                duration: 1,
                pitch: 60,
                velocity: 127,
                muted: 0
            }
        ],
        expectedOutput: string = "rm(_4,4,16,4) ns(c3,c3,c3); rm(_12,4) ns(c3)",
        result: string = convertNoteListToRecurseCode(testInput);

    test.equal(result, expectedOutput, `Expected test input to be transformed to ${expectedOutput}. Actual output: ${result}`);
    test.end();
});