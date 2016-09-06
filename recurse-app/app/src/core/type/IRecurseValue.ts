import ValueType from "../../interpreter/ValueType";
import INode from "../../interpreter/INode";

export interface IRecurseValue {
    value: number;
    valueType: ValueType;
    refToTargetNode?: INode;
}
