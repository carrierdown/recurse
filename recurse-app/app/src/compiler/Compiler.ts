import _ = require('lodash');
import program = require('commander');
import dgram = require('dgram');
import osc = require('osc-min');

import RecurseResult from "../core/type/RecurseResult";
import ICompilerSettings from "./ICompilerSettings";
import RecurseStatus from "../core/type/RecurseStatus";
import ErrorMessages from "./ErrorMessages";
import Lexer from "../interpreter/Lexer";
import Parser from "../interpreter/Parser";
import RecurseObject from "../core/type/RecurseObject";
import ISyntaxTree from "../interpreter/ISyntaxTree";
import IToken from "../interpreter/IToken";
import NoteEvent from "../core/type/NoteEvent";
import flatten from "../converter/flatten";

export default class Compiler {
    public inport = 8008;
    public outport = 8009;
    private udp;
    public settings: any = {};
    public defaults: ICompilerSettings = {
        preview: false,
        debug: true
    };

    constructor() {
        this.udp = dgram.createSocket('udp4');
        _.defaults(this.settings, this.defaults);
//        console.log('settings are now', this.settings);
    }

    public compile(code: string): RecurseResult<NoteEvent[][]> {
        var lexer: Lexer,
            tokens: Array<IToken>,
            parseResult: RecurseResult<ISyntaxTree>,
            compileResult: RecurseResult<NoteEvent[][]>,
            noteEvents: NoteEvent[][],
            jsonOutput: string;

        lexer = new Lexer();
        tokens = lexer.getTokenSet(code.toString());
        parseResult = Parser.parseTokensToSyntaxTree(tokens);
        compileResult = new RecurseResult<NoteEvent[][]>(parseResult.status, parseResult.error);

        if (parseResult.isOk()) {
            if (this.settings.debug) {
                Parser.printSyntaxTree(parseResult.result);
            }
            let generated = parseResult.result.generate();
            //console.log('generated result', generated);
            noteEvents = flatten(generated);
            compileResult.result = noteEvents;
            jsonOutput = JSON.stringify(noteEvents);
            if (this.settings.debug) {
                console.log(jsonOutput);
            }
            if (!this.settings.preview) {
                this.sendOscMessage(jsonOutput);
            }
        }
        return compileResult;
    }

    public setPreview(state: boolean) {
        this.settings.preview = state;
    }

    public setDebug(state: boolean) {
        this.settings.debug = state;
    }

    private sendOscMessage(message: string): void {
        var buf: any;
        buf = osc.toBuffer({
            address: '/recurse/data',
            args: [
                {
                    type: 'string',
                    value: message
                }
            ]
        });
        this.udp.send(buf, 0, buf.length, this.outport, 'localhost', (err: any) => {
            this.udp.close();
        });
    }
}