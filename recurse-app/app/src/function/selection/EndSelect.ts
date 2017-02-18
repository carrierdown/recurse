import _ = require('lodash');

import {IRecurseValue} from "../../core/type/IRecurseValue";
import {INode} from "../../interpreter/INode";
import {IContext} from "../IContext";
import {Entity} from "../../interpreter/Entity";

export class EndSelect implements INode {
    public type: Entity = Entity.END_SELECT;
    public children: Array<INode> = [];
    public parent: INode;

    constructor(parent: INode = null, children: Array<INode> = []) {
        this.parent = parent;
        this.children = children;
    }

    public generate(context: IContext): Array<IRecurseValue> {
        context.selectionActive = false;
        context.selectedIndexes = [];

        return [];
    }
}