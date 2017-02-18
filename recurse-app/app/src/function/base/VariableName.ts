import {IRecurseValue} from "../../core/type/IRecurseValue";
import {INode} from "../../interpreter/INode";
import {IContext} from "../IContext";
import {Entity} from "../../interpreter/Entity";

export class VariableName implements INode {
    public type: Entity = Entity.VARIABLE_NAME;
    public children: Array<INode> = [];
    public parent: INode;
    public name: string;

    constructor(parent: INode, name: string) {
        this.parent = parent;
        this.name = name;
    }

    public generate(context: IContext): Array<IRecurseValue> {
        return [];
    }
}