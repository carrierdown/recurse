import {INode} from "../../interpreter/INode";
import {IContext} from "../IContext";
import {IRecurseValue} from "../../core/type/IRecurseValue";
import {forEachSelectedPitch} from "../../core/util/forEachSelectedPitch";
import {forEachPitch} from "../../core/util/forEachPitch";
import {Entity} from "../../interpreter/Entity";

export class Transpose implements INode {
    public type: Entity = Entity.TRANSPOSE;
    public children: INode[];
    public parent: INode;

    constructor(parent: INode = null, children: INode[] = []) {
        this.parent = parent;
        this.children = children;
    }

    // todo: simplify - we should only do relative pitching according to current mode here, e.g. major, minor, pentatonic, etc
    // if we instead want to ensure that all notes fall within current scale then something like quantizeScale should be used instead.
    public generate(context: IContext): IRecurseValue[] {
        var results: IRecurseValue[] = [],
            doTranspose = (index: number, pitch: number): number => {
                return pitch + context.scale.scaleDegreeToPitchRelative(results[index].value);
            };

        for (let child of this.children) {
            results = results.concat(child.generate(context));
        }

        if (results.length > 0) {
            if (context.selectionActive) {
                forEachSelectedPitch(context, doTranspose);
            }
            else {
                forEachPitch(context, doTranspose);
            }
        }
        return [];
    }
}