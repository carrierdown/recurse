import INode from '../../interpreter/INode';
import Entity from '../../interpreter/Entity';
import IContext from '../../function/IContext';
import {IRecurseValue} from "../../core/type/IRecurseValue";
import ISetting from "../../interpreter/ISetting";

export default class PatternLength implements ISetting {
    value: number;
    type: Entity = Entity.PATTERN_LENGTH;

    constructor(value: number = 64) {
        this.value = value;
    }

    public apply(context: IContext): void {
        context.patternLength = this.value;
    }
}