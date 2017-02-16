import INode from "../../interpreter/INode";
import {IRecurseValue} from "../../core/type/IRecurseValue";
import IContext from "../IContext";
import Entity from "../../interpreter/Entity";
import {TokenType} from "../../interpreter/TokenType";
import Repeat from "./Repeat";
import Alternate from "./Alternate";
import Range from "./Range";
import Interpolate from "./Interpolate";

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
