import {IRecurseValue} from "../../core/type/IRecurseValue";
import {INode} from "../../interpreter/INode";
import {IContext} from "../IContext";
import {Entity} from "../../interpreter/Entity";

export class Variable implements INode {
    public type: Entity = Entity.VARIABLE;
    public children: Array<INode>;
    public parent: INode;
    public name: string;

    constructor(name: string, contents: INode[]) {
        this.parent = null;
        this.children = contents;
        this.name = name;
    }

    public generate(context: IContext): IRecurseValue[] {
        var results: IRecurseValue[] = [];

        for (let child of this.children) {
            results = results.concat(child.generate(context));
        }
        return results;
    }

    public generateVar(context: IContext, parent: INode): IRecurseValue[] {
        this.parent = parent;
        var results: IRecurseValue[] = this.generate(context);
        this.parent = null;
        return results;
    }
}