// This construct is similar to a "part" in traditional sequencers like Cubase etc.
// Transforms that need information about all notes in a part should be done here, such as mutate/shuffle/etc.

import {INode} from "../../interpreter/INode";
import {ISetting} from "../../interpreter/ISetting";
import {IContext} from "../IContext";
import {IRecurseValue} from "../../core/type/IRecurseValue";
import {Entity} from "../../interpreter/Entity";

export class Chain implements INode {
    public type: Entity = Entity.CHAIN;
    public children: Array<INode>;
    public parent: INode;
    public settings: Array<ISetting>;

    constructor(parent: INode = null, children: Array<INode> = []) {
        this.parent = parent;
        this.children = children;
        this.settings = [];
    }

    public generate(context: IContext): Array<IRecurseValue> {
        // apply any chain-level settings prior to generation
        for (let setting of this.settings) {
            setting.apply(context);
        }
        console.log('settings applied', context);
        for (let child of this.children) {
            child.generate(context);
        }
        // LoopFactor
        // for now, only whole number loop factors are supported - but would be nice to have floating point values as well
        if (context.loopFactor < 1) {
            return [];
        }
        for (let i = 0; i < context.loopFactor - 1; i++) {
            context.results = context.results.concat(context.results);
        }
        return [];
    }
}