import {INode} from "../../interpreter/INode";
import {IContext} from "../IContext";
import {IRecurseValue} from "../../core/type/IRecurseValue";
import {Entity} from "../../interpreter/Entity";
import {ValueType} from "../../interpreter/ValueType";

export class NoteSet implements INode {
    public type: Entity = Entity.NS;
    public children: Array<INode> = [];
    public parent: INode;

    constructor(parent: INode = null, children: Array<INode> = []) {
        this.parent = parent;
        this.children = children;
    }

    public generate(context: IContext): Array<IRecurseValue> {
        var results: Array<IRecurseValue> = [];
        for (let child of this.children) {
            results = results.concat(child.generate(context));
        }
        let i = 0;
        for (let result of context.results) {
            if (result.pitches.length === 0) {
                result.pitches.push(results[i % results.length].value);
            }
            i++;
        }
        return [];
    }
}