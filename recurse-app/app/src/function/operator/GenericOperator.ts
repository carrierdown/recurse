import {IRecurseValue} from "../../core/type/IRecurseValue";
import {INode} from "../../interpreter/INode";
import {TokenType} from "../../interpreter/TokenType";
import {IContext} from "../IContext";
import {ISyntaxTree} from "../../interpreter/ISyntaxTree";
import {Alternate} from "./Alternate";
import {Variable} from "../base/Variable";
import {VariableReference} from "../base/VariableReference";
import {Repeat} from "./Repeat";
import {Interpolate} from "./Interpolate";
import {Range} from "./Range";
import {Entity} from "../../interpreter/Entity";
import {Multiply} from "./Multiply";

export class GenericOperator implements INode {
    public type: Entity;
    public children: INode[] = [];

    constructor(public operatorToken: TokenType) {
        this.type = Entity.GENERIC_OPERATOR;
    }

    public generate(context:IContext): IRecurseValue[] {
        return [];
    }

    public transform(parent: INode, node1: INode, node2: INode, syntaxTree: ISyntaxTree): INode {
        var newNode;
        switch (this.operatorToken) {
            case TokenType.SINGLE_QUOTE:
                if (node1.type === Entity.ALT_SHORTHAND) {
                    // previous node is an alternating shorthand statement as well, meaning that we should merge into that node instead.
                    newNode = node1;
                    node2.parent = newNode;
                    newNode.children.push(node2);
                    return newNode;
                } else {
                    newNode = new Alternate(parent, true);
                }
                break;
            case TokenType.EQUALS:
                // assignment - empty variable is already created when variable name is encountered for the first time, so retrieve it and populate it.
                if (node2.type !== Entity.NESTED) {
                    throw new Error(`Expected nested block following assignment, but found ${Entity[node2.type]}`);
                }
                if (node1.type !== Entity.VARIABLE_REFERENCE) {
                    throw new Error(`Expected variable name preceding = operator, but found ${Entity[node1.type]}`);
                }
                let varNode = syntaxTree.variables[node1.name];
                for (let child of node2.children) {
                    child.parent = varNode;
                }
                varNode.children = node2.children;                //newNode = new VariableReference(parent, node1.name, varNode);
                return null;
            case TokenType.REPEAT:
                newNode = new Repeat(parent, true);
                break;
            case TokenType.MULTIPLY:
                if (node1.type === Entity.VALUE && node2.type === Entity.NESTED) {
                    return this.mergeWithHead(node1, node2, Entity.MULTIPLY);
                }
                newNode = new Multiply(parent);
                break;
            case TokenType.DOUBLE_PERIOD:
                if (node1.type === Entity.VALUE && node2.type === Entity.NESTED) {
                    return this.mergeWithHead(node1, node2, Entity.RANGE_SHORTHAND);
                }
                newNode = new Range(parent, true);
                break;
            case TokenType.RIGHT_ANGLE:
                if (node1.type === Entity.VALUE && node2.type === Entity.NESTED) {
                    return this.mergeWithHead(node1, node2, Entity.INTERPOLATE);
                }
                newNode = new Interpolate(parent);
                break;
            default:
                throw new Error(`Transform: Found no matches for ${TokenType[this.operatorToken]}`);
        }
        node1.parent = node2.parent = newNode;

        newNode.children = [node1, node2];
        return newNode;
    }

    private mergeWithHead(node1: INode, node2: INode, entity: Entity): INode {
        if (!node2.hasOwnProperty('head')) {
            throw new Error(`${Entity[entity]} operator can not be used with anonymous nested block`);
        }
        var result = node2,
            currentHeadNode = node2['head'];
        var newHeadNode;
        switch (entity) {
            case Entity.RANGE_SHORTHAND:
                newHeadNode = new Range(result, true);
                break;
            case Entity.INTERPOLATE:
                newHeadNode = new Interpolate(result);
                break;
            case Entity.MULTIPLY:
                newHeadNode = new Multiply(result);
                break;
            default:
                throw new Error(`GenericOperator.mergeWithHead failed to find match for ${Entity[entity]}`);
        }
        newHeadNode.children = [node1, currentHeadNode];
        node1.parent = currentHeadNode.parent = newHeadNode;
        result['head'] = newHeadNode;
        return result;
    }
}
