import {IRecurseValue} from "../../core/type/IRecurseValue";
import {INode} from "../../interpreter/INode";
import {IContext} from "../IContext";
import {Entity} from "../../interpreter/Entity";

export class Root implements INode {
    public type: Entity = Entity.ROOT;
    public children: Array<INode>;
    public parent: INode;
    public newClip: boolean;
    public contextRef: IContext;

    constructor(newClip: boolean) {
        this.parent = null;
        this.children = [];
        this.newClip = newClip;
    }

    // Root serves as a clip/container construct.
    public generate(context: IContext): Array<IRecurseValue> {
        //var offsetMultiplier: number = 0;
        context.createNewClip = this.newClip;
        this.contextRef = context;

        for (let child of this.children) {
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
            child.generate(context);
        }
        //console.log('context is now', context, context.results);
        return [];
    }
}