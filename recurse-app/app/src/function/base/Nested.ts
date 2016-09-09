import _ = require('lodash');

import INode from '../../interpreter/INode';
import Entity from '../../interpreter/Entity';
import IContext from '../../function/IContext';
import {IRecurseValue} from "../../core/type/IRecurseValue";
import ValueType from "../../interpreter/ValueType";
import Parser from "../../interpreter/Parser";
import Helpers from "../../core/util/Helpers";

export default class Nested implements INode {
    public type: Entity = Entity.NESTED;
    public value: number;
    public children: Array<INode>;
    public parent: INode;
    public associatedNode: INode;

    constructor(value: number = -1, parent: INode = null) {
        this.value = value;
        this.parent = parent;
        this.children = [];
    }

    public generate(context: IContext): Array<IRecurseValue> {
        var results: Array<IRecurseValue> = [];

        // Is this node contained by an rm?
        // if so - create path to here, counting only structural nodes like nested
        let parentRm: INode = Parser.getParentNodeOfType(Entity.RM, this);
        if (parentRm !== null && !context.prePhase) {
            let path: number[] = [],
                node: INode = this;

            while (node.parent !== parentRm.parent) {
                let index = Helpers.getIndexFromParent(node);
                // todo: Maybe only accept NESTED or other constructs that create an actual hierarchy - not alt, repeat and so on
                if (node.parent.type !== Entity.ALT && node.parent.type !== Entity.ALT_SHORTHAND) {
                    path.unshift(index);
                }
                node = node.parent;
            }
            //console.log("path", path);
            // then try matching created path to the closest match in the associated noteset (need special handling for things like alt and maybe also repeat)
            let noteSetNode: INode = Helpers.getSiblingWithType(parentRm, Entity.NS),
                targetNode: INode = noteSetNode;

            for (let index of path) {
                while (targetNode.type === Entity.ALT || targetNode.type === Entity.ALT_SHORTHAND) {
                    let curIx = targetNode['alternationIndex'] || -1;
                    targetNode = targetNode.children[(curIx + 1) % targetNode.children.length];
                }
                if (targetNode.children.length > 0) {
                    targetNode = targetNode.children[index % noteSetNode.children.length];
                } else {
                    break;
                }
            }
            //console.log('Found target node with type', Entity[targetNode.type], 'and value', targetNode['value']);
        }

        if (this.associatedNode) {
            results = this.associatedNode.generate(context);
        } else {
            for (let child of this.children) {
                results = results.concat(child.generate(context));
            }
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

        if (results.length > 0 && results[0].valueType !== ValueType.NOTE && results[0].valueType !== ValueType.RAW_NOTE) {
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
        }
        return results;
    }
}