import {INode} from "./INode";
import {RecurseObject} from "../core/type/RecurseObject";

export interface ISyntaxTree {
    rootNodes: INode[];
    variables: any;
    generate: () => RecurseObject[][];
    findVariable: (name: string) => INode;
}