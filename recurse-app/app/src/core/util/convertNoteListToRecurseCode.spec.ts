import tape = require('tape');

import {convertNoteListToRecurseCode} from "./convertNoteListToRecurseCode";

tape('convert overlapping notes to separate recurse declarations', (test) => {
    // note that this input is not realistic since pitch is the same for the overlapping notes, but it nonetheless tests the relevant code correctly
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
        expectedOutput: string = "length(32) rm(_4,4,16,4,_4) ns(c3); length(32) rm(_12,4,_16) ns(c3)",
        result: string = convertNoteListToRecurseCode(testInput, 8);

    test.equal(result, expectedOutput, `Expected test input to be transformed to ${expectedOutput}. Actual output: ${result}`);
    test.end();
});

tape('convert notes on different pitches to separate declarations when using drum mode', (test) => {
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
                pitch: 62,
                velocity: 127,
                muted: 0
            },
            {
                start: 3,
                duration: 1,
                pitch: 64,
                velocity: 127,
                muted: 0
            },
            {
                start: 6,
                duration: 1,
                pitch: 61,
                velocity: 127,
                muted: 0
            }
        ],
        expectedOutput: string = "length(32) rm(_4,4,_24) ns(c3); length(32) rm(_8,16,_8) ns(d3); length(32) rm(_12,4,_16) ns(e3); length(32) rm(_24,4,_4) ns(c#3)",
        result: string = convertNoteListToRecurseCode(testInput, 8, 1 /* DRUM mode */);

    test.equal(result, expectedOutput, `Expected test input to be transformed to ${expectedOutput}. Actual output: ${result}`);
    test.end();
});

tape('convert straight-forward sequence of notes to one recurse declaration', (test) => {
    var testInput: {start: number, duration: number, pitch: number, velocity: number, muted: number}[] = [
            {
                start: .5,
                duration: .25,
                pitch: 62,
                velocity: 127,
                muted: 0
            },
            {
                start: 1,
                duration:.25,
                pitch: 64,
                velocity: 117,
                muted: 0
            },
            {
                start: 0,
                duration: .25,
                pitch: 65,
                velocity: 127,
                muted: 0
            },
            {
                start: 2.75,
                duration:.25,
                pitch: 65,
                velocity: 127,
                muted: 0
            }
        ],
        expectedOutput: string = "length(16) rm(1,_1,1,_1,1,_6,1,_4) ns(f3,d3,e3,f3) vel(127,127,117,127)",
        result: string = convertNoteListToRecurseCode(testInput, 4);

    test.equal(result, expectedOutput, `Expected test input to be transformed to ${expectedOutput}. Actual output: ${result}`);
    test.end();
});
