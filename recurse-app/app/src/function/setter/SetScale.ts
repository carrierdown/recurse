import {IRecurseValue} from "../../core/type/IRecurseValue";
import {ISetting} from "../../interpreter/ISetting";
import {IContext} from "../IContext";
import {Scale} from "../../core/type/Scale";
import {Entity} from "../../interpreter/Entity";

export class SetScale implements ISetting {
    value: string;
    type: Entity = Entity.SET_SCALE;

    constructor(value: string) {
        this.value = value;
    }

    public apply(context: IContext): void {
        if (Scale.isScaleNameValid(this.value)) {
            context.scale = Scale.getScaleFromName(this.value);
        } else {
            console.log('Warning: attempted to set unrecognized scale ' + this.value);
        }
    }
}