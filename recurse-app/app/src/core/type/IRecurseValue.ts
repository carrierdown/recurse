import {INode} from "../../interpreter/INode";
import {ValueType} from "../../interpreter/ValueType";

export interface IRecurseValue {
    value: number;
    valueType: ValueType;
    refToTargetNode?: INode;
    additionalValues?: {value: number, valueType: ValueType}[];
}
