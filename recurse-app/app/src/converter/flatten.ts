import _ = require('lodash');

import RecurseObject from "../core/type/RecurseObject";
import NoteEvent from "../core/type/NoteEvent";
import INode from "../interpreter/INode";
import {Constants} from "../core/type/Constants";
import {IClip} from "./IClip";

// "flattens" sequence for consumption by a typical sequencer. Flattening makes intervals relative to zero rather than the preceding note event
export default function flatten(itemsSets: Array<Array<RecurseObject>>, clipRootNodes: INode[]): IClip[] {
    var currentPos: number = 0,
        flattenedResultsSets: IClip[] = [],
        flattenedResults: Array<NoteEvent> = [],
        currentRefNode: INode = null;

    // todo: should probably do some sorting according to order-property prior to flattening
    for (let i = 0; i < itemsSets.length; i++) {
        let items = itemsSets[i];
        for (let item of items) {
            if (currentRefNode === null || item.refToGenNode !== currentRefNode) {
                currentRefNode = item.refToGenNode;
                currentPos = getQuarterNoteValue(currentRefNode.startOffset); // startOffset always specified in sixteenths? Or should it follow global res? Probably the latter...
            }

            // todo: current precision level (1/16, 1/64, etc) should probably come into play here...
            currentPos = _.round(currentPos + getQuarterNoteValue(item.preRest), 3);
            let interval = getQuarterNoteValue(item.interval);
            for (let pitch of item.pitches) {
                flattenedResults.push(new NoteEvent(currentPos, interval, pitch, item.velocity || Constants.DEFAULT_VELOCITY));
            }
            currentPos += interval + getQuarterNoteValue(item.postRest);
        }
        flattenedResultsSets.push({notes:_.clone(flattenedResults), loopLength: clipRootNodes[i].contextRef.patternLength} as IClip);
        flattenedResults = [];
    }
    return flattenedResultsSets;
}

function getQuarterNoteValue(value: number, divisor: number = 4): number {
    return _.round(value / divisor, 3);
}