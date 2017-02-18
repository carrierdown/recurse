import {INode} from "../../interpreter/INode";
import {IContext} from "../IContext";
import {IRecurseValue} from "../../core/type/IRecurseValue";
import {Entity} from "../../interpreter/Entity";

export class VelocitySet implements INode {
    public type: Entity = Entity.VEL;
    public children: INode[] = [];
    public parent: INode;

    constructor(parent: INode = null, children: INode[] = []) {
        this.parent = parent;
        this.children = children;
    }

    public generate(context: IContext): IRecurseValue[] {
        var results: IRecurseValue[] = [];
        for (let child of this.children) {
            results = results.concat(child.generate(context));
        }
        let i = 0;
        for (let result of context.results) {
            if (!result.velocity) {
                result.velocity = results[i % results.length].value;
            }
            i++;
        }
        return [];
    }
}