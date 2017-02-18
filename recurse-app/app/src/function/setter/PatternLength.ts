import {ISetting} from "../../interpreter/ISetting";
import {IContext} from "../IContext";
import {Entity} from "../../interpreter/Entity";

export class PatternLength implements ISetting {
    value: number;
    type: Entity = Entity.PATTERN_LENGTH;

    constructor(value: number = 64) {
        this.value = value;
    }

    public apply(context: IContext): void {
        context.patternLength = this.value;
    }
}