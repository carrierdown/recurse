import _ = require('lodash');

import {IRecurseValue} from "../../core/type/IRecurseValue";
import {INode} from "../../interpreter/INode";
import {IContext} from "../IContext";
import {Entity} from "../../interpreter/Entity";

export class Random implements INode {
    public type: Entity = Entity.RND;
    public children: Array<INode>;
    public parent: INode;
    public cache: Array<number> = [];
    public invokeCount: number = 0;

    constructor(parent: INode = null, children: Array<INode> = []) {
        this.parent = parent;
        this.children = children;
    }

    public reset() {
        this.cache = [];
        this.invokeCount = 0;
    }

    // todo: for loop to work properly, we need to take extra measures in several generators to reset internal params if needed.
    // random and interp will both need this. alt won't unless one wants to retrigger alternation for each loop iteration (probably not)
    public generate(context: IContext): Array<IRecurseValue> {
        if (this.children.length === 0) {
            return [];
        }
        if (context.prePhase) { // todo: prePhase not yet impl
            this.cache.push(Math.floor(Math.random() * this.children.length));
            return this.children[this.cache[this.cache.length - 1]].generate(context);
        } else {
            var index: number = this.cache[this.invokeCount];
            this.invokeCount++;
            return this.children[index].generate(context);
        }
    }
}