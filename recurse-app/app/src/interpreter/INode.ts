import IContext from '../function/IContext';
import Entity from './Entity';
import {IRecurseValue} from "../core/type/IRecurseValue";
import ISetting from "./ISetting";

interface INode {
    type: Entity;
    children: Array<INode>;
    parent?: INode;
    reference?: INode; // holds reference to another node in the case of statements like stack, +rm, etc.
    clonedContext?: IContext; // the referenced node will have a cloned copy of it's context when generation occurred, which can be used by the node referring to it
    generate: (context: IContext) => Array<IRecurseValue>;
    startOffset?: number;
    reset?: () => void;
    settings?: Array<ISetting>;
}

export default INode;