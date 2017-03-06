import {IRecurseValue} from "../../core/type/IRecurseValue";
import {INode} from "../../interpreter/INode";
import {IContext} from "../IContext";
import {ValueType} from "../../interpreter/ValueType";
import {Entity} from "../../interpreter/Entity";

export class Range implements INode {
    public type: Entity = Entity.RANGE;
    public children: Array<INode>;
    public parent: INode;

    constructor(parent: INode = null, shorthand: boolean = false) {
        if (shorthand) {
            this.type = Entity.RANGE_SHORTHAND;
        }
        this.parent = parent;
        this.children = [];
    }

    // todo: support automatic scaling of values according to number of notes if used on e.g. velocities?
    public generate(context: IContext): Array<IRecurseValue> {
        if (this.children.length !== 2) {
            console.log('WARN: Range produced no output due to incorrect number of params. Expected 2 and got ' + this.children.length);
            return;
        }
        var start: IRecurseValue = this.children[0].generate(context)[0],
            end: IRecurseValue = this.children[1].generate(context)[0],
            startValue = start.value,
            endValue = end.value,
            results: Array<IRecurseValue> = [];

        if (start.valueType !== start.valueType) {
            console.log(`WARN: Range expected arguments of same type, but received ${ValueType[start.valueType]} and ${ValueType[end.valueType]}`);
        }
        if (startValue > endValue) {
            for (let i = startValue; i >= endValue; i--) {
                results.push({value: i, valueType: start.valueType});
            }
        } else {
            for (let i = startValue; i <= endValue; i++) {
                results.push({value: i, valueType: start.valueType});
            }
        }
        return results;
    }
}