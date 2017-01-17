import _ = require('lodash');

import INode from '../../interpreter/INode';
import Entity from '../../interpreter/Entity';
import IContext from '../../function/IContext';
import forEachSelectedPitch from "../../core/util/forEachSelectedPitch";
import forEachPitch from "../../core/util/forEachPitch";
import {IRecurseValue} from "../../core/type/IRecurseValue";

export default class Pitch implements INode {
    public type: Entity = Entity.PITCH;
    public children: Array<INode> = [];
    public parent: INode;
    private plusMode: boolean;

    constructor(parent: INode = null, children: Array<INode> = [], plusMode = true) {
        this.parent = parent;
        this.children = children;
        this.plusMode = plusMode;
    }

    public generate(context: IContext): Array<IRecurseValue> {
        var results: Array<IRecurseValue> = [],
            iterationCounter: number = 1,
            doPitch = (index: number, pitch: number): number => {
                iterationCounter = Math.floor(index / results.length) + 1;
                return pitch + results[index % results.length].value * (this.plusMode ? iterationCounter : 1);
            };

        _.forEach(this.children, (child) => {
            results = results.concat(child.generate(context));
        });

        if (results.length > 0) {
            if (context.selectionActive) {
                forEachSelectedPitch(context, doPitch);
            }
            else {
                forEachPitch(context, doPitch);
            }
        }
        return [];
    }
}