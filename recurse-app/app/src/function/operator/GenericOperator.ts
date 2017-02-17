import INode from "../../interpreter/INode";
import {IRecurseValue} from "../../core/type/IRecurseValue";
import IContext from "../IContext";
import Entity from "../../interpreter/Entity";
import {TokenType} from "../../interpreter/TokenType";
import Repeat from "./Repeat";
import Alternate from "./Alternate";
import Range from "./Range";
import Interpolate from "./Interpolate";
import Variable from "../base/Variable";

export class GenericOperator implements INode {
    public type: Entity;
    public children: INode[] = [];

    constructor(public operatorToken: TokenType) {
        this.type = Entity.GENERIC_OPERATOR;
    }

    public generate(context:IContext): IRecurseValue[] {
        return [];
    }

    public transform(parent: INode, node1: INode, node2: INode): INode {
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
                // assignment - create variable node (Entity.VARIABLE) and store contents inside. Add node to special variable list, and add reference (e.g. Entity.VARIABLE_REF) to entry from syntax tree.
                if (node2.type !== Entity.NESTED) {
                    throw new Error(`Expected nested block following assignment, but found ${Entity[node2.type]}`);
                }
                if (node1.type !== Entity.VARIABLE_NAME) {
                    throw new Error(`Expected variable name preceding = operator, but found ${Entity[node1.type]}`);
                }
                newNode = new Variable(node2.children);
                break;
            case TokenType.REPEAT:
                newNode = new Repeat(parent, true);
                break;
            case TokenType.DOUBLE_PERIOD:
                newNode = new Range(parent, true);
                break;
            case TokenType.RIGHT_ANGLE:
                newNode = new Interpolate(parent);
                break;
            default:
                throw Error(`Transform: Found no matches for ${TokenType[this.operatorToken]}`);
        }
        newNode.children = [node1, node2];
        return newNode;
    }
}
