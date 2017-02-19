import {IRecurseValue} from "../../core/type/IRecurseValue";
import {INode} from "../../interpreter/INode";
import {IContext} from "../IContext";
import {Entity} from "../../interpreter/Entity";

export class VariableReference implements INode {
    public type: Entity = Entity.VARIABLE_REFERENCE;
    public children: Array<INode> = [];
    public parent: INode;
    public variableRef: INode;
    public name: string;

    constructor(parent: INode, name: string, variableRef: INode) {
        this.parent = parent;
        this.name = name;
        this.variableRef = variableRef;
    }

    public generate(context: IContext): Array<IRecurseValue> {
        return this.variableRef.generate(context);
    }
}