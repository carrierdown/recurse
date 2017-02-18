import {RecurseObject} from "../core/type/RecurseObject";
import {Scale} from "../core/type/Scale";

export interface IContext {
    endPosition: number;
    loopFactor: number; // number of times.Can also be <1, but need to handle floats first
    patternLength: number;
    prePhase: boolean;
    results: Array<RecurseObject>;
    rootOct: number;
    scale: Scale;
    selectedIndexes: Array<number>;
    selectionActive: boolean; // kan evt droppe selectionActive og heller sjekke selectedIndexes direkte, i.e. tømme denne når den ikke er aktiv, den må uansett reinstansieres ved hver select
    startOffset: number;
    startPosition: number;
    createNewClip: boolean; // if true, generated notes are put into a new buffer
    //idSequenceTicker: number; // meant as an internal sequence of id's which can be used for events that need to be tagged and are related, such as
    //currentPosition: number; // maybe start using this again - this way morphs could be done in subnode given that they have all context info (length, loop, curpos). However, it would still need to know total length of sequence, which it doesn't have access to yet...
}