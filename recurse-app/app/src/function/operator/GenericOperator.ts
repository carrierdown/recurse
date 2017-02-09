import INode from "../../interpreter/INode";
import {IRecurseValue} from "../../core/type/IRecurseValue";
import IContext from "../IContext";
import Entity from "../../interpreter/Entity";
import {TokenType} from "../../interpreter/TokenType";

export class GenericOperator implements INode {
    public type: Entity;
    public children: INode[] = [];

    constructor(public operatorToken: TokenType) {
        this.type = Entity.GENERIC_OPERATOR;
    }

    public generate(context:IContext): IRecurseValue[] {
        return [];
    }
}
