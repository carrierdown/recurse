import _ = require('lodash');
import {IRecurseValue} from "../../core/type/IRecurseValue";
import {Parser} from "../../interpreter/Parser";
import {Helpers} from "../../core/util/Helpers";
import {INode} from "../../interpreter/INode";
import {IContext} from "../IContext";
import {Entity} from "../../interpreter/Entity";
import {ValueType} from "../../interpreter/ValueType";
import {Value} from "./Value";

export class Nested implements INode {
    public type: Entity = Entity.NESTED;
    public children: INode[];
    public parent: INode;
    public associatedNodes: INode[];
    public head: INode;

    constructor(parent: INode = null, head: INode = null) {
        this.parent = parent;
        this.children = [];
        this.associatedNodes = [];
        this.head = head;
    }

    public generate(context: IContext): Array<IRecurseValue> {
        // Is this node contained by an rm?
        // if so - create path to here, counting only structural nodes like nested
        var parentRm: INode = Parser.getParentNodeOfType(Entity.RM, this);
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
            this.addAssociatedNodeOfType(Entity.VEL, parentRm, path);
        }
        /*
        // todo: if we want to support FILL inside nested statements as well... Idea: if * is present in nested, do not rescale values but let head value control length instead of scaling
         // If we have a FILL element, figure out its size and set it
         let fillNodeIndex = _.findIndex(results, ['valueType', ValueType.FILL]);
         if (fillNodeIndex > -1) {
         let sum = _.sumBy(results, (result: IRecurseValue) => {
         return (_.isNaN(result.value) || result.value === null) ? 0 : result.value;
         });
         results[fillNodeIndex].value = context.patternLength - sum;
         }
        */

        var totalResults = [];

        if (this.head) {
            let headValues = this.head.generate(context);
            for (let headValue of headValues) {
                // Note: By doing generation for each occurence, we are saying that e.g. 1..3(4'5'6 3) would be equal to 1(4 3) 2(5 3) 3(6 3)
                //       rather than 1(4 3) 2(4 3) 3(4 3).
                totalResults = totalResults.concat(this.generateValues(context, headValue.value));
            }
        } else {
            totalResults = totalResults.concat(this.generateValues(context, -1));
        }
        return totalResults;
    }

    private addAssociatedNodeOfType(entity: Entity, parent: INode, path: number[]): void {
        let targetNode: INode = Helpers.getSiblingWithType(parent, entity);

        if (!targetNode) {
            return;
        }

        for (let index of path) {
            if (targetNode.children.length > 0) {
                targetNode = targetNode.children[index % targetNode.children.length];
                while ((targetNode.type === Entity.ALT || targetNode.type === Entity.ALT_SHORTHAND) && targetNode.children.length > 0) {
                    let curIx = targetNode['alternationIndex'] || -1;
                    targetNode = targetNode.children[(curIx + 1) % targetNode.children.length];
                }
            } else {
                break;
            }
        }
        //console.log('Found target node with type', Entity[targetNode.type], 'and value', targetNode['value']);

        if (targetNode.type !== Entity.NESTED && path.length < 2) {
            return;
        }

        if (this.associatedNodes.indexOf(targetNode) < 0) {
            this.associatedNodes.push(targetNode);
        }
    }

    private generateValues(context: IContext, value: number) {
        var results = [];
        let doScaleValues: boolean = (value > 0);
        for (let child of this.children) {
            results = results.concat(child.generate(context));
        }

        if (results.length > 0 && results[0].valueType === ValueType.INTERVAL || results[0].valueType === ValueType.REST) {
            if (doScaleValues) {
                let sum: number = 0;
                for (let result of results) {
                    sum += result.value;
                }

                for (let i = 0; i < results.length; i++) {
                    results[i].value = (results[i].value / sum) * value;
                }
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
                    let additionalValueOfTypeAlreadyAdded = false;
                    for (let additionalValue of result.additionalValues) {
                        if (additionalValue.valueType === associatedResults[i].valueType) {
                            additionalValueOfTypeAlreadyAdded = true;
                            break;
                        }
                    }
                    if (!additionalValueOfTypeAlreadyAdded) {
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
}