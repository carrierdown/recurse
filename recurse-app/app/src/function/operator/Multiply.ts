import {INode} from "../../interpreter/INode";
import {Entity} from "../../interpreter/Entity";
import {IContext} from "../IContext";
import {IRecurseValue} from "../../core/type/IRecurseValue";

export class Multiply implements INode {
    public type: Entity = Entity.MULTIPLY;
    public children: Array<INode>;
    public parent: INode;

    constructor(parent: INode = null, children: Array<INode> = []) {
        this.parent = parent;
        this.children = children;
    }

    public generate(context: IContext): Array<IRecurseValue> {
        if (this.children.length !== 2) {
            throw new Error(`Multiply expected 2 parameters, but found ${this.children.length}`);
        }
        if (this.children[0].type !== Entity.VALUE || this.children[1].type !== Entity.VALUE) {
            throw new Error(`Multiply expected 2 value parameters but found parameter 1 of type ${Entity[this.children[0].type]} and parameter 2 of type ${Entity[this.children[1].type]}`);
        }
        var result: IRecurseValue = this.children[0].generate(context)[0];
        result.value *= this.children[1].generate(context)[0].value;
        return [result];
    }
}