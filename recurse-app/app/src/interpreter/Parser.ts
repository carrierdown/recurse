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
import VelocitySet from "../function/generator/VelocitySet";
import {GenericOperator} from "../function/operator/GenericOperator";
import Helpers from "../core/util/Helpers";
import VariableName from "../function/base/VariableName";

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

    public static get COMMA_LEFT_HAND_SIDE_TOKENS(): TokenType[] {
        return [TokenType.NUMBER, TokenType.NOTE, TokenType.MULTIPLY, TokenType.RIGHT_PAREN];
    }

    public static get COMMA_RIGHT_HAND_SIDE_TOKENS(): TokenType[] {
        return [TokenType.NUMBER, TokenType.NOTE, TokenType.MULTIPLY, TokenType.IDENTIFIER, TokenType.UNDERSCORE];
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
        } else if (value !== true) {
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
            case Entity.PITCH_PLUS: return new Pitch(parent, children, true);
            case Entity.PITCH_OFFSET: return new Value(value, parent, ValueType.PITCH_OFFSET);
            case Entity.RANGE: return new Range(parent, false);
            case Entity.RANGE_SHORTHAND: return new Range(parent, true);
            case Entity.REPEAT: return new Repeat(parent, false);
            case Entity.REPEAT_SHORTHAND: return new Repeat(parent, true);
            case Entity.REST: return new Value(value, parent, ValueType.REST);
            case Entity.REST_SHORTHAND: return new Value(value, parent, ValueType.REST);
            case Entity.RM: return new RhythmicMotive(parent, children);
            case Entity.RND: return new Random(parent, children);
            case Entity.ROOT: return new Root(value === true);
            case Entity.SELECT: return new Select(parent, SelectStrategy.indexList);
            case Entity.SELECT_INDEX: return new Value(value, parent, ValueType.SELECT_INDEX);
            case Entity.TRANSPOSE: return new Transpose(parent, children);
            case Entity.VEL: return new VelocitySet(parent, children);
            case Entity.VELOCITY: return new Value(value, parent, ValueType.VELOCITY);
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
            case 'itrpl':
            case 'interpolate':
                return Entity.INTERPOLATE;
            case 'loop':
                return Entity.LOOP_FACTOR;
            case 'last':
                return Entity.LAST;
            case 'ns':
            case 'noteset':
            case 'notes':
                return Entity.NS;
            case 'odd':
                return Entity.ODD;
            case 'length':
                return Entity.PATTERN_LENGTH;
            case 'pitch':
                return Entity.PITCH;
            case '+pitch':
                return Entity.PITCH_PLUS;
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
            case 'velocities':
            case 'velocityset':
            case 'vel':
            case 'vs':
                return Entity.VEL;
            default:
                console.log('couldn\'t find identifier...');
                return Entity.INVALID;
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

    public static createAndAddNodeToChildrenAndRetrieve(node: INode, nodeTypeToAdd: Entity): INode {
        node.children.push(Parser.createNode(nodeTypeToAdd, node));
        return node.children[node.children.length - 1];
    }

    public static preProcessTokens(tokenSet: IToken[]): void {
        if (tokenSet.length < 2) {
            return;
        }
        for (let i = 1; i < tokenSet.length; i++) {
            if (Parser.COMMA_LEFT_HAND_SIDE_TOKENS.indexOf(tokenSet[i - 1].type) >= 0 &&
                Parser.COMMA_RIGHT_HAND_SIDE_TOKENS.indexOf(tokenSet[i].type) >= 0) {
                tokenSet.splice(i, 0, {type: TokenType.COMMA, value: ',', pos: tokenSet[i].pos - 1} as IToken);
                i++;
            }
        }
    }

    // todo: remove RecurseResult stuff and use exceptions instead
    public static parseTokensToSyntaxTree(tokenSet: Array<IToken>): RecurseResult<ISyntaxTree> {
        var current: INode = Parser.createNode(Entity.ROOT, null),
            syntaxTree: ISyntaxTree = new SyntaxTree(),
            result: RecurseResult<ISyntaxTree> = new RecurseResult<ISyntaxTree>();

        if (!Parser.checkParens(tokenSet)) {
            return result.setError(ErrorMessages.getError(
                ErrorMessages.PARENTHESES_DO_NOT_MATCH
            ));
        }

        Parser.preProcessTokens(tokenSet);

        syntaxTree.rootNodes[0] = current;
        current = Parser.createAndAddNodeToChildrenAndRetrieve(current, Entity.CHAIN);

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

            let entityType;

            switch (tokenSet[i].type) {
                /* --- LITERALS --- */
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
                    current.children.push(Parser.createNode(entityType, current, tokenSet[i].value));
                    break;
                /* --- OPERATORS --- */
                case TokenType.SINGLE_QUOTE:
                case TokenType.RIGHT_ANGLE:
                case TokenType.REPEAT:
                case TokenType.DOUBLE_PERIOD:
                case TokenType.EQUALS:
                    current.children.push(new GenericOperator(tokenSet[i].type));
                    break;
                /* --- PUNCTUATION --- */
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
                case TokenType.LEFT_PAREN:
                    // if we just created e.g. an rm, we are currently on the parent of rm (typically root or chain)
                    // when the l_paren is encountered we want to change current to point to our newly created item, in this case rm
                    // further items encountered (typically numbers) are pushed onto the children of rm
                    // In other words, l_paren and r_paren don't modify anything, they simply move current to point to a newly created item,
                    // or moving the pointer out from the newly created item
                    let lastChild = void 0;
                    if (current.children.length > 0) {
                        lastChild = current.children[current.children.length - 1];
                    } else {
                        // If we get here then it probably means we have just encountered a left parenthesis and encountered one more immediately. Create a new nested anonymous block.
                        current.children.push(Parser.createNode(Entity.NESTED, current, -1));
                        current = _.last(current.children);
                        break;
                    }
                    if (lastChild && (lastChild.type === Entity.VALUE)) {
                        // nested statement with/without head value
                        if (tokenSet[i].isolatedLeft) {
                            current.children.push(Parser.createNode(Entity.NESTED, current, -1));
                        } else {
                            current.children[current.children.length - 1] = Parser.createNode(Entity.NESTED, current, lastChild.value);
                        }
                        current = _.last(current.children);
                        break;
                    }
                    if (lastChild && lastChild.type === Entity.GENERIC_OPERATOR) {
                        current.children.push(Parser.createNode(Entity.NESTED, current, -1));
                        current = _.last(current.children);
                        break;
                    }
                    if (lastChild && lastChild.type > Entity._KEYWORDS_BEGIN && lastChild.type < Entity._KEYWORDS_END) {
                        current = _.last(current.children);
                    }
                    //console.log('l_paren', current, current.parent);
                    //console.log('l_paren', current, current.parent);
                    break;
                case TokenType.RIGHT_PAREN:
                    // current = Parser.exitShorthandStatements(current);
                    // no children on current node is not necessarily an error (could be an empty func())
                    current = current.parent;
                    break;
                case TokenType.COMMA:
                    // if we're in a chain, the comma breaks it
                    //if (current.type === Entity.CHAIN) {
                    //    current = current.parent;
                    //}
                    // current = Parser.exitShorthandStatements(current);
                    break;
                case TokenType.PIPE: // experimental: | now signifies what ; used to mean earlier
                    if (current.type !== Entity.CHAIN) {
                        return result.setError(ErrorMessages.getError(ErrorMessages.NOT_IN_CHAIN));
                    }
                    console.log('here');
                    current = Parser.createAndAddNodeToChildrenAndRetrieve(current.parent, Entity.CHAIN);
                    console.log('and there');
                    break;
                case TokenType.SEMI:
                    // creates new track
                    let newTrackRoot: INode = Parser.createNode(Entity.ROOT, null, false);
                    syntaxTree.rootNodes.push(newTrackRoot);
                    current = Parser.createAndAddNodeToChildrenAndRetrieve(newTrackRoot, Entity.CHAIN);
                    break;
                case TokenType.DOUBLE_SEMI:
                    // creates a new clip
                    let newClipRoot: INode = Parser.createNode(Entity.ROOT, null, true);
                    syntaxTree.rootNodes.push(newClipRoot);
                    current = Parser.createAndAddNodeToChildrenAndRetrieve(newClipRoot, Entity.CHAIN);
                    break;
                /* --- VARIABLES --- */
                case TokenType.VARIABLE_NAME:
                    if (nextToken.type !== TokenType.EQUALS) {
                        // this is a variable reference - resolve it

                    } else {
                        // this is a variable name followed by assignment. Store name for now.
                        current.children.push(new VariableName(current, tokenSet[i].value));
                    }
/*
                    if (nextToken.type === TokenType.EQUALS) {
                        // assignment - create variable node (Entity.VARIABLE) and store contents (nested block) inside. Add node to special variable list, and add reference (e.g. Entity.VARIABLE_REF) to entry from syntax tree.
                    } else {
                        // reference - search for given variable name in variable list and add reference (Entity.VARIABLE_REF) if exists
                    }
*/
                    break;
                /* --- KEYWORDS --- */
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

        function resolveOperators(node: INode) {
            //console.log("Walking node", Entity[node.type]);
            let containsGenericOp = false;
            for (let childNode of node.children) {
                if (childNode.type === Entity.GENERIC_OPERATOR) {
                    containsGenericOp = true;
                    break;
                }
            }
            for (let i = 0; i < node.children.length; i++) {
                if (node.children[i].type === Entity.GENERIC_OPERATOR && i > 0 && i < node.children.length - 1) {
                    //console.log("Transforming generic operator");
                    let newNode: INode = node.children[i].transform(node, node.children[i - 1], node.children[i + 1]);
                    i = i - 1;
                    node.children.splice(i, 3, newNode);
                } else {
                    // console.log('Error during chomping');
                }
                resolveOperators(node.children[i]);
            }
        }

        // after parsing, we do a second phase where operators are resolved
        for (let node of syntaxTree.rootNodes) {
            resolveOperators(node);
        }

        // Parser.printSyntaxTree(syntaxTree);

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
            case Entity.VEL:
                return Entity.VELOCITY;
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

    public static getParentNodeOfType(entity: Entity, node: INode): INode {
        var current: INode = null;
        if (node.type === entity) {
            return node;
        }
        current = node.parent;
        while (current !== null && current.type !== entity) {
            current = current.parent;
        }
        return current;
    }

    // todo: remove
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

        if (node['value'] !== undefined) {
            value = node['value'];
        }

        output += `
            ${_.repeat(' ', level)}- type:      ${Entity[node.type]}
            ${_.repeat(' ', level)}  value:     ${value || ''}`;

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
