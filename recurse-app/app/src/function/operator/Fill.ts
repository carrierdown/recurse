import {IRecurseValue} from "../../core/type/IRecurseValue";
import {INode} from "../../interpreter/INode";
import {IContext} from "../IContext";
import {ValueType} from "../../interpreter/ValueType";
import {Entity} from "../../interpreter/Entity";

export class Fill implements INode {
    public type: Entity = Entity.FILL;
    public children: Array<INode>;
    public parent: INode;

    constructor(parent: INode = null, children: Array<INode> = []) {
        this.parent = parent;
        this.children = children;
    }

    public generate(context: IContext): Array<IRecurseValue> {
        return [{value: 0, valueType: ValueType.FILL}];
    }
}
