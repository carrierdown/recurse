import INode from '../../interpreter/INode';
import Entity from '../../interpreter/Entity';
import IContext from '../../function/IContext';
import {IRecurseValue} from "../../core/type/IRecurseValue";

export default class Repeat implements INode {
    public type: Entity = Entity.REPEAT;
    public children: Array<INode>;
    public parent: INode;

    constructor(parent: INode = null, shorthand: boolean = false) {
        if (shorthand) {
            this.type = Entity.REPEAT_SHORTHAND;
        }
        this.parent = parent;
        this.children = [];
    }

    public generate(context: IContext): Array<IRecurseValue> {
        if (this.children.length !== 2) {
            console.log('WARN: Repeat produced no output due to incorrect params');
            return;
        }
        var numRepeats: number = this.children[1].generate(context)[0].value,
            results: Array<IRecurseValue> = [];

        for (let i = 0; i < numRepeats; i++) {
            results.push(this.children[0].generate(context)[0]);
        }
        return results;
    }
}