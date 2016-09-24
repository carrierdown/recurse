import INode from '../../interpreter/INode';
import Entity from '../../interpreter/Entity';
import IContext from '../../function/IContext';
import {IRecurseValue} from "../../core/type/IRecurseValue";
import Value from "../base/Value";

export default class VelocitySet implements INode {
    public type: Entity = Entity.VEL;
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
            console.log("velocity", result.velocity);
            if (!result.velocity) {
                result.velocity = results[i % results.length].value;
            }
            console.log("velocity", result.velocity);
            i++;
        }
        return [];
    }
}