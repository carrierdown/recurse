import program = require('commander');
import fs = require('fs');
var watch = require('node-watch');

import {IClip} from "./converter/IClip";
import {Compiler} from "./compiler/Compiler";
import {RecurseResult} from "./core/type/RecurseResult";
import {RecurseStatus} from "./core/type/RecurseStatus";
import {ErrorMessages} from "./compiler/ErrorMessages";

program
    .version('0.0.1')
    .usage('[options] [file]')
    .option('-p, --preview', 'Compile and output to console only')
    .option('-d, --debug', 'Log debug info to console')
    .option('-w, --watch', 'Watch source file and recompile on changes')
    .parse(process.argv);

if (program['args'].length > 0) {
    var file: string = program['args'][0],
        preview: boolean = program['preview'] || false,
        debug: boolean = program['debug'] || false;

    console.log('compiling', file);

    doCompile(file, preview, debug);

    if (program['watch']) {
        watch(file, function(filename) {
            console.log(filename, ' changed.');
            doCompile(filename, preview, debug);
        });
    }
} else {
    console.log('No arguments given, exiting');
}

function doCompile(filename, preview, debug) {
    var compiler = new Compiler(),
        result: RecurseResult<IClip[]> = new RecurseResult<IClip[]>();

    compiler.setPreview(preview);
    compiler.setDebug(debug);

    fs.readFile(filename, (err, code) => {
        if (!err) {
            result = compiler.compile(code.toString());
        } else {
            result.status = RecurseStatus.ERROR;
            result.error = ErrorMessages.getError(ErrorMessages.FILE_READ_ERROR, file);
        }
        console.log(result);
    });
}