import INode from '../../interpreter/INode';
import Entity from '../../interpreter/Entity';
import IContext from '../../function/IContext';
import {IRecurseValue} from "../../core/type/IRecurseValue";
import ISetting from "../../interpreter/ISetting";

export default class Loop implements ISetting {
    value: number;
    type: Entity = Entity.LOOP_FACTOR;

    constructor(value: number = 1) {
        this.value = value;
    }

    public apply(context: IContext): void {
        context.loopFactor = this.value;
    }
}