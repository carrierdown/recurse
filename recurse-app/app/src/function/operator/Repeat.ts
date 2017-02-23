import {IRecurseValue} from "../../core/type/IRecurseValue";
import {INode} from "../../interpreter/INode";
import {IContext} from "../IContext";
import {Entity} from "../../interpreter/Entity";

export class Repeat implements INode {
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

        // Swap arguments if they are obviously in the wrong order
        if (this.children[0].type === Entity.NESTED && this.children[1].type === Entity.VALUE) {
            [this.children[0], this.children[1]] = [this.children[1], this.children[0]];
        }

        var numRepeats: number = this.children[1].generate(context)[0].value,
            results: IRecurseValue[] = [];

        for (let i = 0; i < numRepeats; i++) {
            results = results.concat(this.children[0].generate(context));
        }
        return results;
    }
}
