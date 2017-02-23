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

        _.forEach(this.children, (child) => {
            results = results.concat(child.generate(context));
        });
        _.forEach(results, (result: IRecurseValue) => {
            params.push(result.value);
        });

        var selectionStates: boolean[] = [];
        for (let i = 0; i < context.results.length; i++) {
            selectionStates[i] = false;
        }
        if (context.selectionActive && context.selectedIndexes.length > 0) {
            for (let i = 0; i < context.selectedIndexes.length; i++) {
                selectionStates[context.selectedIndexes[i]] = true;
            }
        }

        var n: number = Math.floor(selectionStates.length / 2),
            result: Array<number> = [];

        for (var i = 0; i < n; i++) {
            result.push(i * 2 + 1);
        }
        return result;

        // todo: redo this - atm we won't get correct indices for stacked selections
        if (context.selectionActive && context.selectedIndexes.length > 0) {
            context.selectedIndexes = SelectStrategyTable[this.strategy](context.selectedIndexes.length, params);
        } else {
            context.selectedIndexes = SelectStrategyTable[this.strategy](context.results.length, params);
        }

        if (context.selectedIndexes.length > 0) {
            context.selectionActive = true;
        }
        return [];
    }
}