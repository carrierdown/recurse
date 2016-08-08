import _ = require('lodash');

import INode from '../../interpreter/INode';
import Entity from '../../interpreter/Entity';
import IContext from '../../function/IContext';
import { SelectStrategy, SelectStrategyTable } from './SelectStrategy';
import {IRecurseValue} from "../../core/type/IRecurseValue";
import Value from "../base/Value";

export default class Select implements INode {
    public type: Entity = Entity.SELECT;
    public children: Array<INode> = [];
    public parent: INode;
    public strategy: SelectStrategy;

    constructor(parent: INode = null, strategy: SelectStrategy = SelectStrategy.indexList, children: Array<INode> = []) {
        this.parent = parent;
        this.children = children;
        this.strategy = strategy;
    }

    // todo: add support for skipping rests - maybe handle by creating temp array of rests with their respective indexes so that they can be plucked out and
    // inserted again after the select operation - however, the indexes would change...
    // possible other method is to consolidate rest into the note itself, either using duration/interval or some additional param
    public generate(context: IContext): Array<IRecurseValue> {
        var results: Array<IRecurseValue> = [],
            params: Array<number> = [];

        _.forEach(this.children, (child) => {
            results = results.concat(child.generate(context));
        });
        _.forEach(results, (result: IRecurseValue) => {
            params.push(result.value);
        });

        // discards any previous selection
        context.selectedIndexes = SelectStrategyTable[this.strategy](context.results.length, params);

        if (context.selectedIndexes.length > 0) {
            context.selectionActive = true;
        }
        return [];
    }
}