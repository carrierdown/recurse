import _ = require('lodash');

import INode from '../../interpreter/INode';
import Entity from '../../interpreter/Entity';
import IContext from '../../function/IContext';
import {IRecurseValue} from "../../core/type/IRecurseValue";

export default class EndSelect implements INode {
    public type: Entity = Entity.ENDSELECT;
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