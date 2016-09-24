import _ = require('lodash');

import tape = require('tape');
import fs = require('fs');
import path = require('path');

import Compiler from "./Compiler";
import RecurseResult from "../core/type/RecurseResult";
import RecurseStatus from "../core/type/RecurseStatus";
import ISyntaxTree from "../interpreter/ISyntaxTree";
import NoteEvent from "../core/type/NoteEvent";

function forEachFileInDir(dirname: string, callback: (filename: string, content: string, expectedContent: string) => void, finalize: () => void, soloFile: string = '') {
    var filenames:Array<string> = fs.readdirSync(dirname);

    if (soloFile.length > 0 && filenames.indexOf(soloFile) >= 0) {
        filenames = [soloFile];
    }

    for (let filename of filenames) {
        // Only test files ending in .rse
        if (filename.indexOf('.rse') === filename.length - '.rse'.length) {
            let expectedFilename = path.join(dirname, `${filename}.json`);
            callback(filename,
                fs.readFileSync(path.join(dirname, filename), 'utf-8'),
                fs.existsSync(expectedFilename) ? fs.readFileSync(expectedFilename, 'utf-8') : ''
            );
        }
    }
    finalize();
}

tape('Testing compiler with valid code', (test) => {
    var compiler: Compiler = new Compiler(),
        compile: RecurseResult<NoteEvent[][]>,
        dirname: string = path.join(__dirname, '../../../testCode/valid/'),
        propertiesToTest: string[] = ['start', 'duration', 'pitch', 'velocity'];

    compiler.setDebug(true);
    compiler.setPreview(true);

    forEachFileInDir(dirname, (filename, content, expectedContent) => {
        compile = compiler.compile(content);
        if (compile.status === RecurseStatus.ERROR) {
            console.log(`Compiler failed with: ${compile.error}`);
        }
        test.equal(compile.status, RecurseStatus.OK, `file: ${filename} containing ${content} should compile ok`);

        if (expectedContent.length > 0) {
            let expectedResultsSets = JSON.parse(expectedContent) as NoteEvent[][];
            for (let i = 0; i < expectedResultsSets.length; i++) {
                let expectedResults = expectedResultsSets[i];
                test.equal(expectedResults.length, compile.result[i].length, `Expected output length ${expectedResults.length} and actual output length ${compile.result[i].length} should be the same`);
                for (let x = 0; x < expectedResults.length; x++) {
                    let expectedResult = expectedResults[x];
                    let compiledResult = compile.result[i][x];
                    for (let propertyToTest of propertiesToTest) {
                        if (expectedResult[propertyToTest]) {
                            test.equal(expectedResult[propertyToTest], compiledResult[propertyToTest], `Property ${propertyToTest} of expected output (${expectedResult[propertyToTest]}) and actual output (${compiledResult[propertyToTest]}) should be the same (${filename})`);
                        }
                    }
                }
            }
        }
    }, () => {
        test.end();
    }/*, 'vel.rse'*/);
});

tape('Testing compiler with invalid code', (test) => {
    var compiler: Compiler = new Compiler(),
        result: RecurseResult<NoteEvent[][]>,
        dirname: string = path.join(__dirname, '../../../testCode/invalid/');

    compiler.setDebug(false);
    compiler.setPreview(true);

    forEachFileInDir(dirname, (filename, content) => {
        result = compiler.compile(content);
        if (result.status === RecurseStatus.ERROR) {
            console.log(`Compiler failed with: ${result.error}`);
        }
        test.equal(result.status, RecurseStatus.ERROR, `file: ${filename} containing ${content} should not compile ok. Error returned was ${result.error}`);
    }, () => {
        test.end();
    });
});

// Misc tests that need special setup/assertions

tape('Testing random function', (test) => {
    var compiler: Compiler = new Compiler();

    compiler.setDebug(false);
    compiler.setPreview(true);

    // rnd invokes are repeated manually rather than being looped so that we avoid issues with events being chopped of at the end which are hard to test. We instead use * to make sure that only "clean" events are produced.
    let compiled: RecurseResult<NoteEvent[][]> = compiler.compile('rm(rnd(4,6,8), rnd(1,2,3), rnd(4,6,8), rnd(1,2,3), rnd(4,6,8), rnd(1,2,3), rnd(4,6,8), rnd(1,2,3), *) ns(c3)');

    test.equal(compiled.status, RecurseStatus.OK, `Compilation should be successful`);
    let i = 0;
    let evenValues: number[] = [],
        oddValues: number[] = [];
    for (let result of compiled.result[0]) {
        if (i % 2 === 0) {
            test.ok(result.duration === 1 || result.duration === 1.5 || result.duration === 2, `Expected 1 or 1.5 or 2, and got ${result.duration}`);
            evenValues.push(result.duration);
        } else {
            test.ok(result.duration === 0.25 || result.duration === 0.5 || result.duration === 0.75, `Expected 0.25 or 0.5 or 0.75, and got ${result.duration}`);
            oddValues.push(result.duration);
        }
        i++;
    }

    test.ok(_.toArray(_.countBy(oddValues)).length > 1, `Expected more than one unique result to be returned from random during generation ${_.toArray(_.countBy(oddValues)).length}`);
    test.ok(_.toArray(_.countBy(evenValues)).length > 1, `Expected more than one unique result to be returned from random during generation ${_.toArray(_.countBy(evenValues)).length}`);

    test.end();
});