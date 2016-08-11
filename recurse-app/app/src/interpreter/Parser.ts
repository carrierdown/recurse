import _ = require('lodash');

import IToken from './IToken';
import INode from './INode';
import ISyntaxTree from './ISyntaxTree';
import SyntaxTree from '../function/SyntaxTree';
import Note from '../core/type/Note';

import Nested from '../function/base/Nested';
import Root from '../function/base/Root';
import NoteSet from '../function/generator/NoteSet';
import RhythmicMotive from '../function/generator/RhythmicMotive';
import Alternate from '../function/operator/Alternate';
import Chain from '../function/operator/Chain';
import Repeat from '../function/operator/Repeat';
import Transpose from "../function/modifier/Transpose";
import Select from "../function/selection/Select";
import { SelectStrategy } from "../function/selection/SelectStrategy";
import EndSelect from "../function/selection/EndSelect";
import { TokenType, TokenTypeExpect, getExpectsString } from "./TokenType";
import RecurseResult from "../core/type/RecurseResult";
import ErrorMessages from "../compiler/ErrorMessages";
import Random from "../function/operator/Random";
import Fill from "../function/operator/Fill";
import Value from "../function/base/Value";
import ValueType from "./ValueType";
import Entity from "./Entity";
import Interpolate from "../function/operator/Interpolate";
import PatternLength from "../function/setter/PatternLength";
import ISetting from "./ISetting";
import Scale from "../core/type/Scale";
import SetScale from "../function/setter/SetScale";
import Loop from "../function/setter/Loop";
import Pitch from "../function/modifier/Pitch";
import Range from "../function/operator/Range";

export default class Parser {
    public static get SHORTHAND_TOKENS(): Array<TokenType> {
        return [TokenType.REPEAT, TokenType.SINGLE_QUOTE, TokenType.UNDERSCORE]
    }

    public static get SHORTHAND_ENTITIES(): Array<Entity> {
        return [Entity.REST_SHORTHAND, Entity.REPEAT_SHORTHAND, Entity.ALT_SHORTHAND, Entity.RANGE_SHORTHAND]
    }

    public static get SETTING_ENTITIES(): Array<Entity> {
        return [Entity.PATTERN_LENGTH, Entity.LOOP_FACTOR, Entity.SET_SCALE];
    }

    public static tokenSetLookAhead(tokenSet: Array<IToken>, position: number, lookAhead: number): IToken {
        if (position + lookAhead >= tokenSet.length) {
            return {type: TokenType.END, pos: -1, value: ''};
        } else if (position + lookAhead < 0) {
            return {type: TokenType.START, pos: -1, value: ''};
        } else {
            return tokenSet[position + lookAhead];
        }
    }

    public static createSetting(type: Entity, value: any = null): ISetting {
        if (type === Entity.NOTE) {
            value = Note.pitchFromNoteName(value);
        } else if (type === Entity.LOOP_FACTOR) {
            value = parseInt(value, 10);
        }
        switch (type) {
            case Entity.PATTERN_LENGTH:
                return new PatternLength(value);
            case Entity.SET_SCALE:
                return new SetScale(value);
            case Entity.LOOP_FACTOR:
                return new Loop(value);
        }
    }

    public static createNode(type: Entity, parent: INode = null, value: any = null, children: Array<INode> = []): INode {
        if (type === Entity.NOTE) {
            value = Note.pitchFromNoteName(value);
        } else {
            value = parseInt(value, 10);
        }

        switch (type) {
            case Entity.ALT: return new Alternate(parent, false);
            case Entity.ALT_SHORTHAND: return new Alternate(parent, true);
            case Entity.CHAIN: return new Chain(parent, children);
            case Entity.END_SELECT: return new EndSelect(parent);
            case Entity.EVEN: return new Select(parent, SelectStrategy.even);
            case Entity.FILL: return new Value(null, parent, ValueType.FILL);
            case Entity.FIRST: return new Select(parent, SelectStrategy.first);
            case Entity.INTERPOLATE: return new Interpolate(parent);
            case Entity.INTERVAL: return new Value(value, parent, ValueType.INTERVAL);
            case Entity.LAST: return new Select(parent, SelectStrategy.last);
            case Entity.NESTED: return new Nested(value, parent);
            case Entity.NOTE: case Entity.RAW_NOTE: return new Value(value, parent, ValueType.NOTE);
            case Entity.NS: return new NoteSet(parent, children);
            case Entity.ODD: return new Select(parent, SelectStrategy.odd);
            case Entity.PITCH: return new Pitch(parent, children);
            case Entity.PITCH_OFFSET: return new Value(value, parent, ValueType.PITCH_OFFSET);
            case Entity.RANGE: return new Range(parent, false);
            case Entity.RANGE_SHORTHAND: return new Range(parent, true);
            case Entity.REPEAT: return new Repeat(parent, false);
            case Entity.REPEAT_SHORTHAND: return new Repeat(parent, true);
            case Entity.REST: return new Value(value, parent, ValueType.REST);
            case Entity.REST_SHORTHAND: return new Value(value, parent, ValueType.REST);
            case Entity.RM: return new RhythmicMotive(parent, children);
            case Entity.RND: return new Random(parent, children);
            case Entity.ROOT: return new Root();
            case Entity.SELECT: return new Select(parent, SelectStrategy.indexList);
            case Entity.SELECT_INDEX: return new Value(value, parent, ValueType.SELECT_INDEX);
            case Entity.TRANSPOSE: return new Transpose(parent, children);
            default:
                console.log('Parser.createNode: Entity not matching available node type', Entity[type]);
        }
    }

    public static recurseEntityFromIdentifier(entity: string): Entity {
        switch (entity.toLowerCase()) {
            case 'alt':
            case 'alternate':
                return Entity.ALT;
            case 'endselect':
            case 'end':
                return Entity.END_SELECT;
            case 'even':
                return Entity.EVEN;
            case 'first':
                return Entity.FIRST;
            case 'loop':
                return Entity.LOOP_FACTOR;
            case 'last':
                return Entity.LAST;
            case 'ns':
            case 'noteSet':
            case 'notes':
                return Entity.NS;
            case 'odd':
                return Entity.ODD;
            case 'length':
                return Entity.PATTERN_LENGTH;
            case 'pitch':
                return Entity.PITCH;
            case 'rng':
            case 'range':
                return Entity.RANGE;
            case 'rep':
            case 'repeat':
                return Entity.REPEAT;
            case 'rest':
                return Entity.REST;
            case 'rm':
            case 'rhythmicmotive':
            case 'rhythm':
                return Entity.RM;
            case 'random':
            case 'rnd':
                return Entity.RND;
            case 'select':
            case 'sel':
                return Entity.SELECT;
            case 'setscale':
            case 'scale':
                return Entity.SET_SCALE;
            case 'tr':
            case 'transpose':
                return Entity.TRANSPOSE;
            default:
                console.log('couldn\'t find identifier...');
        }
    }

    public static checkParens(tokenSet: Array<IToken>): boolean {
        let parenLevel = 0;
        for (let token of tokenSet) {
            if (token.type === TokenType.LEFT_PAREN) {
                parenLevel++;
            } else if (token.type === TokenType.RIGHT_PAREN) {
                parenLevel--;
            }
            if (parenLevel < 0) {
                return false;
            }
        }
        return parenLevel === 0;
    }

    public static parseTokensToSyntaxTree(tokenSet: Array<IToken>): RecurseResult<ISyntaxTree> {
        var current: INode = Parser.createNode(Entity.ROOT, null),
            syntaxTree: ISyntaxTree = new SyntaxTree(),
            result: RecurseResult<ISyntaxTree> = new RecurseResult<ISyntaxTree>();

        if (!Parser.checkParens(tokenSet)) {
            return result.setError(ErrorMessages.getError(
                ErrorMessages.PARENTHESES_DO_NOT_MATCH
            ));
        }

        syntaxTree.rootNodes[0] = current;
        current.children.push(Parser.createNode(Entity.CHAIN, current));
        current = current.children[current.children.length - 1];

        for (let i = 0; i < tokenSet.length; i++) {
            let nextToken = Parser.tokenSetLookAhead(tokenSet, i, 1);
            let prevToken = Parser.tokenSetLookAhead(tokenSet, i, -1);
            let expects: Array<TokenType> = TokenTypeExpect[prevToken.type];

            if (expects !== undefined && expects.indexOf(tokenSet[i].type) < 0) {
                return result.setError(ErrorMessages.getError(
                    ErrorMessages.UNEXPECTED_TOKEN_ERROR,
                    getExpectsString(expects),
                    TokenType[prevToken.type],
                    TokenType[tokenSet[i].type]
                ));
            }

            // transform notes to numbers while retaining note info for use later if needed
            // currently this info is discarded at node creation
            // prolly redo this logic a bit, using INumber > Note, Interval, Pitch etc
/*
            if (tokenSet[i].type === TokenType.NOTE) {
                tokenSet[i].originalValue = tokenSet[i].value;
                tokenSet[i].originalType = tokenSet[i].type;
                tokenSet[i].value = Note.pitchFromNoteName(tokenSet[i].value);
                tokenSet[i].type = TokenType.NUMBER;
            }
*/

            // todo: use allowedOn and notAllowedOn maps to enforce which functions can be called where (i.e. rm(n,alt(n,n)) is allowed while alt(n,rm(n,n)) is not)
            // todo: Some operator like # or ; creates a new track. Implement by creating new root node and moving current to point to it.

            let entityType;

            switch (tokenSet[i].type) {
                case TokenType.NUMBER:
                case TokenType.NOTE:
                    if (tokenSet[i].type === TokenType.NUMBER) {
                        entityType = Parser.inferGenericValueArgument(current);
                        if (entityType === Entity.INVALID) {
                            return result.setError(ErrorMessages.getError(
                                ErrorMessages.NUMERIC_ARGUMENT_NOT_ALLOWED,
                                Entity[current.type]
                            ));
                        }
                    } else {
                        entityType = Entity.NOTE;
                    }

                    if (Parser.isTerminatingToken(nextToken.type)) {
                        // this is a simple value param
                        current.children.push(Parser.createNode(entityType, current, tokenSet[i].value));
                    } else if (nextToken.type === TokenType.SINGLE_QUOTE) {
                        // this is a shorthand alternating statement
                        if (current.type !== Entity.ALT_SHORTHAND) {
                            let altNode = Parser.createNode(Entity.ALT_SHORTHAND, current);
                            current.children.push(altNode);
                            current = altNode;
                        }
                        current.children.push(Parser.createNode(entityType, current, tokenSet[i].value));
                    } else if (nextToken.type === TokenType.RIGHT_ANGLE && Parser.tokenSetLookAhead(tokenSet, i, 2).type === TokenType.NUMBER) {
                        // this is an interpolate param
                        let interpolateNode = Parser.createNode(Entity.INTERPOLATE, current);
                        interpolateNode.children.push(Parser.createNode(entityType, interpolateNode, tokenSet[i].value));
                        interpolateNode.children.push(Parser.createNode(entityType, interpolateNode, tokenSet[i + 2].value));
                        current.children.push(interpolateNode);
                        i += 2; // skip > and number since we have already processed it
                    } else if (nextToken.type === TokenType.REPEAT) {
                        // this is a shorthand repeat statement
                        // check that were not already in a repeat or alt
                        if ([Entity.REPEAT_SHORTHAND, Entity.ALT_SHORTHAND].indexOf(current.type) === -1) {
                            let repNode = Parser.createNode(Entity.REPEAT_SHORTHAND, current);
                            current.children.push(repNode);
                            current = repNode;
                        } else {
                            // we're already in a repeat or alt
                            if (current.type === Entity.REPEAT_SHORTHAND) {
                                return result.setError(ErrorMessages.getError(ErrorMessages.REPEAT_STATEMENT_TOO_MANY_OPERANDS));
                            } else {
                                return result.setError(ErrorMessages.getError(ErrorMessages.REPEAT_SHORTHAND_INVALID_IN_ALT_SHORTHAND));
                            }
                        }
                        current.children.push(Parser.createNode(entityType, current, tokenSet[i].value));
                    } else if (nextToken.type === TokenType.DOUBLE_PERIOD) {
                        // this is a shorthand range statement
                        if ([Entity.RANGE_SHORTHAND, Entity.ALT_SHORTHAND, Entity.REPEAT_SHORTHAND].indexOf(current.type) === -1) {
                            let rangeNode = Parser.createNode(Entity.RANGE_SHORTHAND, current);
                            current.children.push(rangeNode);
                            current = rangeNode;
                        } else {
                            // todo: error
                        }
                        current.children.push(Parser.createNode(entityType, current, tokenSet[i].value));
                    } else if (nextToken.type === TokenType.LEFT_PAREN) {
                        // this is a nested statement
                        current.children.push(Parser.createNode(Entity.NESTED, current, tokenSet[i].value));
                    }
                    break;
                case TokenType.UNDERSCORE:
                    if (nextToken.type === TokenType.NUMBER) {
                        // this is a rest statement
                        if (Parser.inferGenericValueArgument(current) !== Entity.INTERVAL) {
                            // todo: throw error - rest statements can only appear in interval context
                        }
                        let restNode = Parser.createNode(Entity.REST_SHORTHAND, current, nextToken.value);
                        current.children.push(restNode);
                    } else {
                        return result.setError(ErrorMessages.getError(
                            ErrorMessages.UNEXPECTED_TOKEN_ERROR,
                            TokenType[TokenType.NUMBER],
                            '_ operator',
                            TokenType[nextToken.type]
                        ));
                    }
                    i++; // skip a token since we ate the number following _ operator
                    break;
                case TokenType.MULTIPLY:
                    // todo: check that we dont add multiple FILL entities to one parent
                    current.children.push(Parser.createNode(Entity.FILL, current));
                    break;
/*
                case TokenType.NOTE:
                    current.children.push(Parser.createNode(Entity.NOTE, current, tokenSet[i].value));
                    break;
*/
                case TokenType.LEFT_PAREN:
                    // if we just created e.g. an rm, we are currently on the parent of rm (typically root or chain)
                    // when the l_paren is encountered we want to change current to point to our newly created item, in this case rm
                    // further items encountered (typically numbers) are pushed onto the children of rm
                    // In other words, l_paren and r_paren don't modify anything, they simply move current to point to a newly created item,
                    // or moving the pointer out from the newly created item

                    //console.log('l_paren', current, current.parent);
                    if (Parser.hasChildren(current)) {
                        current = _.last(current.children);
                    } else {
                        console.log('parse error - no children on current node');
                    }
                    //console.log('l_paren', current, current.parent);
                    break;
                case TokenType.RIGHT_PAREN:
                    //console.log('r_paren', current, current.parent);
/*
                    if (current.type === Entity.CHAIN && nextToken.type !== TokenType.PIPE) {
                        // if we're currently in a chain node and the next expression isn't chained, move one step up
                        current = current.parent;
                    }
*/
                    current = Parser.exitShorthandStatements(current);
                    // no children on current node is not necessarily an error (could be an empty func())
                    current = current.parent;
                    break;
                case TokenType.COMMA:
                    // if we're in a chain, the comma breaks it
                    //if (current.type === Entity.CHAIN) {
                    //    current = current.parent;
                    //}
                    current = Parser.exitShorthandStatements(current);
                    break;
                case TokenType.SEMI:
                    // todo: exit current chain and start a new one
                    if (current.type !== Entity.CHAIN) {
                        return result.setError(ErrorMessages.getError(ErrorMessages.NOT_IN_CHAIN));
                    }
                    current.parent.children.push(Parser.createNode(Entity.CHAIN, current.parent));
                    current = current.parent.children[current.parent.children.length - 1];
                    break;
                case TokenType.DOUBLE_SEMI:
                    // creates new track (root object)
                    let newTrack: INode = Parser.createNode(Entity.ROOT, null);
                    syntaxTree.rootNodes.push(newTrack);
                    // todo: fix dupl code for creating new chain
                    newTrack.children.push(Parser.createNode(Entity.CHAIN, newTrack));
                    current = newTrack.children[newTrack.children.length - 1];
                    break;
                case TokenType.DOUBLE_PERIOD:

                    break;
/*
                case TokenType.PIPE:
                    if (current.type !== Entity.CHAIN) {
                        // no chain node currently exists, so we create a new chain node and add the most recently created child node to it
                        if (!Parser.hasChildren(current)) {
                            console.log('parse error - no chainable nodes present');
                            break;
                        }
                        let mostRecentChildNode: INode = _.last(current.children);
                        let chainNode: INode = Parser.createNode(Entity.CHAIN, current);
                        let clonedNode: INode = Parser.createNode(mostRecentChildNode.type, chainNode, mostRecentChildNode['value'] || null, mostRecentChildNode.children);
                        chainNode.children.push(clonedNode);
                        current.children[current.children.length - 1] = chainNode;
                        current = chainNode;
                    }
                    break;
*/
                case TokenType.IDENTIFIER:
                    let entity = Parser.recurseEntityFromIdentifier(tokenSet[i].value);
                    if (entity === Entity.INVALID) {
                        return result.setError(ErrorMessages.getError(ErrorMessages.INVALID_IDENTIFIER, tokenSet[i].value));
                    }
                    // check if this is a setting node or if it's a regular node
                    if (Parser.SETTING_ENTITIES.indexOf(entity) >= 0) {
                        // Settings are parsed here only
                        if (nextToken.type === TokenType.LEFT_PAREN && Parser.tokenSetLookAhead(tokenSet, i, 3).type === TokenType.RIGHT_PAREN) {
                            let setting = Parser.createSetting(entity, this.tokenSetLookAhead(tokenSet, i, 2).value);
                            Parser.getCurrentChain(current).settings.push(setting);
                        } else {
                            console.log('TEMP ERROR - Parser: expected a setting enclosed in parentheses, but found something else');
                        }
                        i += 3; // ( + setting + )
                    } else {
                        current.children.push(Parser.createNode(entity, current));
                    }
                    break;
                default:
                    // probably throw error here
                    console.log('reached default...', TokenType[tokenSet[i].type]);
            }
        }
        result.result = syntaxTree;
        return result;
    }

    private static inferGenericValueArgument(node: INode): Entity {
        if (!node) {
            console.log('Temp: Reached top of tree without matches');
            return Entity.INVALID;
        }
        switch (node.type) {
            case Entity.ROOT:
                // error: no typable arguments possible here
                console.log('Temp: No typable arguments possible here');
                return Entity.INVALID;
            case Entity.RM:
                return Entity.INTERVAL;
            case Entity.NS:
                return Entity.RAW_NOTE;
            case Entity.TRANSPOSE:
            case Entity.PITCH:
                return Entity.PITCH_OFFSET;
            case Entity.SELECT:
                return Entity.SELECT_INDEX;
            case Entity.REPEAT:
            case Entity.REPEAT_SHORTHAND:
                if (node.children.length > 0 && node.children[0].hasOwnProperty('valueType') && node.children[0]['valueType'] === ValueType.NOTE) {
                    return Entity.INTERVAL;
                }
            default:
                return Parser.inferGenericValueArgument(node.parent);
        }
    }

    private static parseToken(token: IToken, current: INode) {

    }

    private static exitShorthandStatements(current: INode): INode {
        while (Parser.isShorthandEntity(current.type)) {
            current = current.parent;
        }
        return current;
    }

    private static getCurrentChain(node: INode): INode {
        var current: INode = null;
        if (node.type === Entity.CHAIN) {
            return node;
        }
        current = node.parent;
        while (current.type !== Entity.CHAIN || current.type !== null) {
            current = current.parent;
        }
        return current;
    }

    private static isTerminatingToken(token: TokenType): boolean {
        return token === TokenType.COMMA || token === TokenType.RIGHT_PAREN; // || tokenName === 'PIPE';
    }

    // determines whether the given token forms part of a shorthand definition such as 3;4;5 or 3*3,
    // which would be shorthand for alt(3,4,5) and rep(3,3) respectively.
    private static isShortHandToken(token: TokenType): boolean {
        return Parser.SHORTHAND_TOKENS.indexOf(token) >= 0;
    }

    private static isShorthandEntity(entityType: Entity): boolean {
        return Parser.SHORTHAND_ENTITIES.indexOf(entityType) >= 0
    }

    public static printSyntaxTree(syntaxTree: ISyntaxTree): void {
        var syntaxTreeOutput = '';
        for (let rootNode of syntaxTree.rootNodes) {
            syntaxTreeOutput += Parser.printSyntaxNode(rootNode, 0);
        }
        console.log(syntaxTreeOutput);
    }

    private static hasChildren(node: INode): boolean {
        return node.children.length > 0;
    }

    private static printSyntaxNode(node: INode, level): string {
        var i,
            output = '',
            parent = '',
            value = '';

        if (node.parent !== null) {
            parent = Entity[node.parent.type];
        }
        if (node['value'] !== undefined) {
            value = node['value'];
        }

        output += `
            ${_.repeat(' ', level)}- type:      ${Entity[node.type]}
            ${_.repeat(' ', level)}  value:     ${value || ''}
            ${_.repeat(' ', level)}  parent:    ${parent}`;

        if (node['valueType']) {
            output += `
            ${_.repeat(' ', level)}  valueType: ${ValueType[node['valueType']]}`;
        }
        if (node['settings']) {
            output += `
            ${_.repeat(' ', level)}  settings: ${Parser.printNodeSettings(node.settings, level)}`;
        }

        for (i = 0; i < node.children.length; i++) {
            output += Parser.printSyntaxNode(node.children[i], level + 2);
        }
        return output;
    }

    private static printNodeSettings(settings: Array<ISetting>, level: number): string {
        let output: string = '';
        for (let setting of settings) {
            output += `
            ${_.repeat(' ', level)}  ${Entity[setting.type]}: ${setting.value}`;
        }
        return output;
    }
}
