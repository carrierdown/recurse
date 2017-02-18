import {IRecurseValue} from "../core/type/IRecurseValue";
import {Entity} from "./Entity";
import {IContext} from "../function/IContext";
import {ISetting} from "./ISetting";
import {ISyntaxTree} from "./ISyntaxTree";

export interface INode {
    type: Entity;
    children: Array<INode>;
    parent?: INode;
    reference?: INode; // holds reference to another node in the case of statements like stack, +rm, etc.
    clonedContext?: IContext; // the referenced node will have a cloned copy of it's context when generation occurred, which can be used by the node referring to it
    contextRef?: IContext; // all root nodes hold a copy of the context they receive, which can be used to extract settings such as lenght etc.
    generate: (context: IContext) => IRecurseValue[];
    startOffset?: number;
    reset?: () => void;
    settings?: Array<ISetting>;
    transform?: (parent: INode, node1: INode, node2: INode, syntaxTree: ISyntaxTree) => INode;
    name?: string;
}