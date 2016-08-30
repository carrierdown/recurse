import INode from '../../interpreter/INode';
import Entity from '../../interpreter/Entity';
import IContext from '../../function/IContext';
import {IRecurseValue} from "../../core/type/IRecurseValue";

export default class Track implements INode {
    public type: Entity = Entity.TRACK;
    public children: Array<INode>;
    public parent: INode;

    constructor() {
        this.parent = null;
        this.children = [];
    }

    public generate(context: IContext): Array<IRecurseValue> {
        //var offsetMultiplier: number = 0;
        for (let child of this.children) {
            child.generate(context);
        }
        //console.log('context is now', context, context.results);
        return [];
    }
}