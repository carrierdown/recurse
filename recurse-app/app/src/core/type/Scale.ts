import {Note} from "./Note";
import {Helpers} from "../util/Helpers";

export class Scale {
    public indexes: Array<number>;
    public name: string;
    public tonicOffset: number = 0;

    constructor(name: string = 'chromatic') {
        this.indexes = Scale.getScaleIndexesFromName(name);
        this.name = name;
        // figure out key if applicable
        if (['major', 'minor'].indexOf(name.substr(name.length - 5).toLowerCase()) >= 0) {
            let tonic = name.substr(0, name.length - 5);
            // replace s with # to get proper note name
            if (tonic.length > 1 && tonic.substr(1,1) === 's') {
                tonic = tonic.substr(0,1) + '#';
            }
            let tonicIndex = Note.indexFromPureNoteName(tonic);
            if (tonicIndex >= 0) {
                this.tonicOffset = tonicIndex;
                console.log('tonic was ' + tonic + ' and offset was ' + this.tonicOffset);
            }
        }
    }

    // todo complete
    public static get validScaleNames(): Array<string> {
        return [
            'cmajor',
            'csmajor',
            'dmajor',
            'dsmajor',
            'emajor',
            'fmajor',
            'fsmajor',
            'gmajor',
            'gsmajor',
            'amajor',
            'asmajor',
            'bmajor',
            'cminor',
            'csminor',
            'dminor',
            'dsminor',
            'eminor',
            'fminor',
            'fsminor',
            'gminor',
            'gsminor',
            'aminor',
            'asminor',
            'bminor',
            'chromatic'
        ];
    }

    public static get majorNoteIndexes(): Array<number> {
        return [0,2,4,5,7,9,11];
    }

    public static get minorNoteIndexes(): Array<number> {
        return [0,2,3,5,7,8,10];
    }

    public static get chromaticScaleIndexes(): Array<number> {
        return [0,1,2,3,4,5,6,7,8,9,10,11];
    }

    public scaleDegreeToPitchRelative(scaleDegree: number): number {
        var pitch: number = 0;
        if (scaleDegree === 0) {
            scaleDegree = 1;
        }
        var offset = Math.floor(((Math.abs(scaleDegree) - 1) / this.indexes.length)) * 12;
        if (scaleDegree > 0) {
            pitch += offset + this.indexes[(scaleDegree - 1) % this.indexes.length];
        } else {
            let reverseIndex = Math.abs(scaleDegree) % this.indexes.length,
                index = 0;
            if (reverseIndex > 0) {
                index = this.indexes.length - reverseIndex;
            }
            pitch -= offset + 12 - this.indexes[index]
        }
        return pitch;
    }

    public scaleDegreeToPitch(scaleDegree: number, rootOct: number = 5): number {
        return (rootOct * 12) + this.tonicOffset + this.scaleDegreeToPitchRelative(scaleDegree);
    }

    public static getScaleFromName(scaleName: string): Scale {
        return new Scale(scaleName);
    }

    public static getScaleIndexesFromName(scale: string): Array<number> {
        if (Scale.isScaleNameValid(scale)) {
            if (scale.substr(scale.length - 5).toLowerCase() === 'major') {
                return Scale.majorNoteIndexes;
            } else if (scale.substr(scale.length - 5).toLowerCase() === 'minor') {
                return Scale.minorNoteIndexes;
            } else {
                return Scale.chromaticScaleIndexes;
            }
        }
    }

    public static isScaleNameValid(scale: string): boolean {
        return (Scale.validScaleNames.indexOf(scale.toLowerCase()) >= 0);
    }
}