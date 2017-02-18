import _ = require('lodash');

import {Constants} from "../core/type/Constants";
import {ISyntaxTree} from "../interpreter/ISyntaxTree";
import {INode} from "../interpreter/INode";
import {RecurseObject} from "../core/type/RecurseObject";
import {IContext} from "./IContext";
import {Scale} from "../core/type/Scale";

export class SyntaxTree implements ISyntaxTree {
    public variables: any = {}; // todo: refine
    public rootNodes: Array<INode> = [];

    public generate(): RecurseObject[][] {
        var contexts: IContext[] = [];
        for (let rootNode of this.rootNodes) {
            contexts.push({
                results: [],
                selectedIndexes: [],
                selectionActive: false,
                patternLength: Constants.DEFAULT_PATTERN_LENGTH,
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

    public findVariable(name: string): INode {
        return this.variables[name] as INode;
    }
}