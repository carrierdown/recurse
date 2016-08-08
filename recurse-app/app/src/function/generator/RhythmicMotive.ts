import _ = require('lodash');

import INode from '../../interpreter/INode';
import Entity from '../../interpreter/Entity';
import IContext from '../../function/IContext';
import RecurseObject from '../../core/type/RecurseObject';
import {IRecurseValue} from "../../core/type/IRecurseValue";
import Value from "../base/Value";
import ValueType from "../../interpreter/ValueType";

export default class RhythmicMotive implements INode {
    public type: Entity = Entity.RM;
    public children: Array<INode> = [];
    public parent: INode;
    public currentPosition: number = 0;
    public startOffset: number;
    // todo: impl these (if needed)
    public reference: INode; // holds reference to another node in the case of statements like stack, +rm, etc.
    public clonedContext: IContext; // the referenced node will have a cloned copy of it's context when generation occurred, which can be used by the node referring to it

    constructor(parent: INode = null, children: Array<INode> = []) {
        this.parent = parent;
        this.children = children;
    }

    private fillBuffer(context: IContext): Array<IRecurseValue> {
        var results: Array<IRecurseValue> = [];

        for (let child of this.children) {
            results = results.concat(child.generate(context));
        }
        return results;
    }

    private resetChildren(child: INode) {
        if (child.reset) {
            child.reset();
        }
        for (let c of child.children) {
            this.resetChildren(c);
        }
    };

    public generate(context: IContext): Array<IRecurseValue> {
        var results: Array<IRecurseValue> = [];
        this.startOffset = context.startOffset;

        // We start by doing a pre-run through all children, prior to actual generation
        // This is so that certain operators like Interpolate need to know entire length of sequence before it can generate correct output
        // Operators that are not deterministic (i.e. random), cache their results in this phase so that it's the same when actual generation is triggered
        // During this phase we also count the number of events the sequence contains, so that actual generation can proceed with less hassle

        // first go through all children and call reset() if available
        for (let child of this.children) {
            this.resetChildren(child);
        }

        context.prePhase = true;
        results = this.fillBuffer(context);

        if (results.length === 0) {
            return;
        }

        // If we have a FILL element, figure out its size and set it
        let fillNodeIndex = _.findIndex(results, ['valueType', ValueType.FILL]),
            fillNodeValue = 0;
        if (fillNodeIndex > -1) {
            let sum = _.sumBy(results, (result: IRecurseValue) => {
                return (_.isNaN(result.value) || result.value === null) ? 0 : result.value;
            });
            fillNodeValue = context.patternLength - sum;
        }

        // do a full pre-pass through all children, updating numEvents as we go
        let i: number = 0,
            numEvents: number = 0;
        do {
            if (i >= results.length) {
                results = this.fillBuffer(context);
                i = 0;
            }
            let result: IRecurseValue = results[i];
            if (result.valueType === ValueType.FILL) {
                this.currentPosition += fillNodeValue;
            } else {
                this.currentPosition += result.value;
            }
            i++;
            numEvents++;
        } while (this.currentPosition < context.patternLength);

        // do actual generation-pass through all children
        this.currentPosition = 0;
        context.prePhase = false;
        results = this.fillBuffer(context);
        let preRest: number = 0;
        for (let i = 0; i < numEvents; i++) {
            if (i >= results.length) {
                results = results.concat(this.fillBuffer(context));
            }

            let result: IRecurseValue = results[i];
            if (result.valueType !== ValueType.REST && result.valueType !== ValueType.FILL) {
                this.currentPosition += preRest;
                // cut event if it bleeds outside pattern
                if (this.currentPosition < context.patternLength && this.currentPosition + result.value > context.patternLength) {
                    result.value = context.patternLength - this.currentPosition;
                }
                this.currentPosition += result.value;
                let ro = RecurseObject.getInstanceFromIntervalWithRests(result.value, preRest, 0);
                ro.refToGenNode = this;
                context.results.push(ro);
                if (preRest > 0) {
                    preRest = 0;
                }
            } else {
                let restValue = result.valueType === ValueType.FILL ? fillNodeValue : result.value;
                if (context.results.length === 0) { // if this is element #0, set preRest for next RO added
                    preRest = restValue;
                } else {
                    context.results[context.results.length - 1].postRest = restValue; // ...otherwise set postRest for previously added RO
                    this.currentPosition += restValue;
                }
            }
        }
        context.startOffset += context.patternLength; // startOffset is kept track of in each rm

        return [];
    }
}