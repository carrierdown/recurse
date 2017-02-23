import _ = require('lodash');

import { SelectStrategy, SelectStrategyTable } from './SelectStrategy';
import {IRecurseValue} from "../../core/type/IRecurseValue";
import {INode} from "../../interpreter/INode";
import {IContext} from "../IContext";
import {Entity} from "../../interpreter/Entity";

export class Select implements INode {
    public type: Entity = Entity.SELECT;
    public children: Array<INode> = [];
    public parent: INode;
    public strategy: SelectStrategy;

    constructor(parent: INode = null, strategy: SelectStrategy = SelectStrategy.indexList, children: Array<INode> = []) {
        this.parent = parent;
        this.children = children;
        this.strategy = strategy;
    }

    public generate(context: IContext): Array<IRecurseValue> {
        var results: Array<IRecurseValue> = [],
            params: Array<number> = [];

        for (let child of this.children) {
            results = results.concat(child.generate(context));
        }
        for (let result of results) { // argument list, e.g. selection index
            params.push(result.value);
        }

        var selectionIndices: number[] = [];
        if (context.selectionActive && context.selectedIndexes.length > 0) {
            selectionIndices = context.selectedIndexes;
        } else {
            for (let i = 0; i < context.results.length; i++) {
                selectionIndices[i] = i;
            }
        }
        context.selectedIndexes = SelectStrategyTable[this.strategy](selectionIndices, params);

        if (context.selectedIndexes.length > 0) {
            context.selectionActive = true;
        }
        return [];
    }
}