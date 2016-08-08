import _ = require('lodash');

import INode from '../../interpreter/INode';
import Entity from '../../interpreter/Entity';
import IContext from '../../function/IContext';
import forEachSelectedPitch from "../../core/util/forEachSelectedPitch";
import forEachPitch from "../../core/util/forEachPitch";
import {IRecurseValue} from "../../core/type/IRecurseValue";
import Scale from "../../core/type/Scale";

export default class Transpose implements INode {
    public type: Entity = Entity.TRANSPOSE;
    public children: Array<INode> = [];
    public parent: INode;

    constructor(parent: INode = null, children: Array<INode> = []) {
        this.parent = parent;
        this.children = children;
    }

    public generate(context: IContext): Array<IRecurseValue> {
        var results: Array<IRecurseValue> = [],
            ix: number = 0,
            rix: number = 0,
            pix: number = 0,
            doTranspose = (index: number, pitch: number): number => {
                let degree = results[index % results.length].value;
                // todo: Temporarily locked to major mode, but this should be a settable property
                return pitch + (Math.floor(degree / 7) * 12) + (Scale.majorNoteIndexes[degree % 7]);
            };

        _.forEach(this.children, (child) => {
            results = results.concat(child.generate(context));
        });

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