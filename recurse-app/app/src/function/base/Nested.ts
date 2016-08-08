import _ = require('lodash');

import INode from '../../interpreter/INode';
import Entity from '../../interpreter/Entity';
import IContext from '../../function/IContext';
import {IRecurseValue} from "../../core/type/IRecurseValue";
import ValueType from "../../interpreter/ValueType";

export default class Nested implements INode {
    public type: Entity = Entity.NESTED;
    public value: number;
    public children: Array<INode>;
    public parent: INode;

    constructor(value: number = -1, parent: INode = null) {
        this.value = value;
        this.parent = parent;
        this.children = [];
    }

    public generate(context: IContext): Array<IRecurseValue> {
        var results: Array<IRecurseValue> = [];

        for (let child of this.children) {
            results = results.concat(child.generate(context));
        }

        /*
        // todo: if we want to support FILL inside nested statements as well...
         // If we have a FILL element, figure out its size and set it
         let fillNodeIndex = _.findIndex(results, ['valueType', ValueType.FILL]);
         if (fillNodeIndex > -1) {
         let sum = _.sumBy(results, (result: IRecurseValue) => {
         return (_.isNaN(result.value) || result.value === null) ? 0 : result.value;
         });
         results[fillNodeIndex].value = context.patternLength - sum;
         }
        */

        let sum: number = 0;
        for (let result of results) {
/*
            if (_.isNaN(result.value) || result.value === null) {
                continue;
            }
*/
            sum += result.value;
        }
        for (let i = 0; i < results.length; i++) {
            results[i].value = (results[i].value / sum) * this.value;
        }
        return results;
    }
}