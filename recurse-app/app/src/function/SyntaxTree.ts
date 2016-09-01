import _ = require('lodash');

import INode from '../interpreter/INode';
import ISyntaxTree from '../interpreter/ISyntaxTree';
import RecurseObject from '../core/type/RecurseObject';
import IContext from './IContext';
import Scale from "../core/type/Scale";
import Note from "../core/type/Note";

export default class SyntaxTree implements ISyntaxTree {
    public rootNodes: Array<INode> = [];

    public generate(): Array<Array<RecurseObject>> {
        var contexts: Array<IContext> = [];
        for (let rootNode of this.rootNodes) {
            contexts.push({
                results: [],
                selectedIndexes: [],
                selectionActive: false,
                patternLength: 64,
                startOffset: 0,
                loopFactor: 1,
                startPosition: 0,
                endPosition: 0,
                prePhase: false,
                scale: new Scale(),
                rootOct: 5,
                createNewClip: false
            });
            rootNode.generate(contexts[contexts.length - 1]);
        }

        var results: Array<Array<RecurseObject>> = [];
        var resultBuffer: Array<RecurseObject> = [];
        for (let context of contexts) {
            if (context.createNewClip) {
                results.push(_.clone(resultBuffer));
                resultBuffer = [];
            }
            resultBuffer = resultBuffer.concat(context.results);
        }
        results.push(resultBuffer);
        return results;
    }
}