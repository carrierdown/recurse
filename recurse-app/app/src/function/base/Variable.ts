import INode from '../../interpreter/INode';
import Entity from '../../interpreter/Entity';
import IContext from '../../function/IContext';
import {IRecurseValue} from "../../core/type/IRecurseValue";

export default class Variable implements INode {
    public type: Entity = Entity.VARIABLE;
    public children: Array<INode>;
    public parent: INode;

    constructor(contents: INode[]) {
        this.parent = null;
        this.children = contents;
    }

    public generate(context: IContext): Array<IRecurseValue> {
        var results: IRecurseValue[] = [];

        for (let child of this.children) {
            results = results.concat(child.generate(context));
        }
        return results;
    }
}