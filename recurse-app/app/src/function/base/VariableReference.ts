import INode from '../../interpreter/INode';
import Entity from '../../interpreter/Entity';
import IContext from '../../function/IContext';
import {IRecurseValue} from "../../core/type/IRecurseValue";

export default class VariableReference implements INode {
    public type: Entity = Entity.VARIABLE_REFERENCE;
    public children: Array<INode> = [];
    public parent: INode;
    public variableRef: INode;

    constructor(parent: INode, variableRef: INode) {
        this.parent = parent;
        this.variableRef = variableRef;
    }

    public generate(context: IContext): Array<IRecurseValue> {
        return this.variableRef.generate(context);
    }
}