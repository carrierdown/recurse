import _ = require('lodash');

import INode from '../../interpreter/INode';
import Entity from '../../interpreter/Entity';
import IContext from '../../function/IContext';
import {IRecurseValue} from "../../core/type/IRecurseValue";

export default class Root implements INode {
    public type: Entity = Entity.ROOT;
    public children: Array<INode>;
    public parent: INode;
    public trackContexts: Array<IContext>;

    constructor() {
        this.parent = null;
        this.children = [];
        this.trackContexts = [];
    }

    // Root serves as a clip/container construct.
    public generate(context: IContext): Array<IRecurseValue> {
        if (this.trackContexts.length === 0) {
            for (let i = 0; i < this.children.length; i++) {
                this.trackContexts.push(_.clone(context));
            }
        }

        for (let i = 0; i < this.children.length; i++) {
            this.children[i].generate(this.trackContexts[i]);
/*
            if (child.type === Entity.RM) {
                // if this is a RM, we want to increment our startOffset, starting at 0. In other words, successive rm calls produce output after each other, rather than being stacked on top of each other.
                // this should be done on RM itself instead, as this won't work (rms are often wrapped in chains)
                context.startOffset = context.patternLength * offsetMultiplier;
                offsetMultiplier++;
            }
*/
            //context.currentPosition = 0; // tl;dr: yep, it should. Should currentPosition be kept track of inside rm instead? Isn't rm only node interested in this property, and should it be shared?
            //console.log('Generating for child', child.type);
        }
        //console.log('context is now', context, context.results);
        return [];
    }
}