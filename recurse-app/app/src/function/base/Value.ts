import INode from '../../interpreter/INode';
import ValueType from '../../interpreter/ValueType';
import IContext from '../../function/IContext';
import Entity from "../../interpreter/Entity";
import {IRecurseValue} from "../../core/type/IRecurseValue";

// todo: create Interval, Note, PitchOffset and so on.. Interval needs to take into account current res for instance, and
// recalc to keep a consistent res of 1/16 for instance. This is important due to other params like patternLength using this reso.

export default class Value implements INode {
    public type: Entity = Entity.VALUE;
    public valueType: ValueType;
    public value: number;
    public children: Array<INode>;
    public parent: INode;
    // if more data needed - could use secondaryValue or similar member, usage could be dictated by valuetype

    constructor(value: number = -1, parent: INode = null, type: ValueType) {
        this.valueType = type;
        this.value = value;
        this.children = [];
        this.parent = parent;
    }

    public generate(context: IContext): Array<IRecurseValue> {
        // todo: do any transforms needed here, based on type: INTERVAL, NOTE, REST, etc.. Interval needs to take into account current res for instance, and
        // recalc to keep a consistent res of 1/16 for instance. This is important due to other params like patternLength using this reso.
        let value = this.value;
/*
        if (this.valueType === ValueType.SCALE_DEGREE) {
            console.log(`Turned ${value} into ${context.scale.scaleDegreeToNote(this.value, context.rootOct)}`);
            value = context.scale.scaleDegreeToNote(this.value, context.rootOct);
        }
*/
        return [{value: value, valueType: this.valueType}];
    }

    // have a lookup table of different valuetype handlers here, called by generate
}