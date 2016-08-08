import INode from '../../interpreter/INode';
import Entity from '../../interpreter/Entity';
import IContext from '../../function/IContext';
import {IRecurseValue} from "../../core/type/IRecurseValue";

export default class Alternate implements INode {
    public type: Entity = Entity.ALT;
    public children: Array<INode>;
    public parent: INode;
    public alternationIndex: number;
    public alternationIndexPre: number;

    constructor(parent: INode = null, shorthand: boolean = false) {
        if (shorthand) {
            this.type = Entity.ALT_SHORTHAND;
        }
        this.parent = parent;
        this.children = [];
        this.alternationIndex = -1;
        this.alternationIndexPre = -1;
    }

    // todo: impl reset if alt should "retrigger" on loop

    public generate(context: IContext): Array<IRecurseValue> {
        if (context.prePhase) {
            this.alternationIndexPre++;
            return this.children[this.alternationIndexPre % this.children.length].generate(context);
        }
        this.alternationIndex++;
        return this.children[this.alternationIndex % this.children.length].generate(context);
    }
}