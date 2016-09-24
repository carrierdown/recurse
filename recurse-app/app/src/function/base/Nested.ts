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
    public children: INode[];
    public parent: INode;
    public associatedNodes: INode[];

    constructor(value: number = -1, parent: INode = null) {
        this.value = value;
        this.parent = parent;
        this.children = [];
        this.associatedNodes = [];
    }

    public generate(context: IContext): Array<IRecurseValue> {
        var results: IRecurseValue[] = [];

        // Is this node contained by an rm?
        // if so - create path to here, counting only structural nodes like nested
        let parentRm: INode = Parser.getParentNodeOfType(Entity.RM, this);
        if (parentRm !== null && !context.prePhase) {
            let path: number[] = [],
                node: INode = this;

            while (node.parent !== parentRm.parent) {
                let index = Helpers.getIndexFromParent(node);
                if (node.parent.type !== Entity.ALT && node.parent.type !== Entity.ALT_SHORTHAND && node.parent.type !== Entity.REPEAT && node.parent.type !== Entity.REPEAT_SHORTHAND) {
                    //console.log('adding', index, 'node parent', Entity[node.parent.type]);
                    path.unshift(index);
                }
                node = node.parent;
            }
            //console.log("path", path);
            // then try matching created path to the closest match in the associated notes and velocities (need special handling for things like alt and maybe also repeat)

            this.addAssociatedNodeOfType(Entity.NS, parentRm, path);
            //this.addAssociatedNodeOfType(Entity.VEL, parentRm, path);

            //console.log('Found target node with type', Entity[targetNode.type], 'and value', targetNode['value']);
            //if (targetNode.type === Entity.NESTED) {
            //    console.log('with first sub value', targetNode.children[0]['value']);
            //}
        }

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

            for (let associatedNode of this.associatedNodes) {
                let associatedResults: IRecurseValue[] = [],
                    i: number = 0;
                for (let result of results) {
                    if (i >= associatedResults.length) {
                        associatedResults = associatedNode.generate(context);
                        i = 0;
                    }
                    if (!result.additionalValues) {
                        result.additionalValues = [];
                    }
                    if (result.additionalValues.length === 0) {
                        result.additionalValues.push({value: associatedResults[i].value, valueType: associatedResults[i].valueType});
                    }
                    i++;
                }
                if (associatedNode.reset) {
                    associatedNode.reset();
                }
            }
        }

        return results;
    }

    private addAssociatedNodeOfType(entity: Entity, parent: INode, path: number[]): void {
        let targetNode: INode = Helpers.getSiblingWithType(parent, entity);

        for (let index of path) {
            if (targetNode.children.length > 0) {
                targetNode = targetNode.children[index % targetNode.children.length];
                //console.log('while', targetNode.type);
                while ((targetNode.type === Entity.ALT || targetNode.type === Entity.ALT_SHORTHAND) && targetNode.children.length > 0) {
                    let curIx = targetNode['alternationIndex'] || -1;
                    targetNode = targetNode.children[(curIx + 1) % targetNode.children.length];
                }
            } else {
                break;
            }
        }
        if (this.associatedNodes.indexOf(targetNode) < 0) {
            this.associatedNodes.push(targetNode);
        }
    }
}