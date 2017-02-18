import {Note} from "./Note";

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

    public scaleDegreeToNote(scaleDegree: number, rootOct: number = 5): number {
        // how should negative values be handled? -1 scale degree for cmaj equals B, or C one octave down?
        if (scaleDegree > 0) {
            scaleDegree -= 1;
        }
        return this.tonicOffset + Scale.majorNoteIndexes[scaleDegree % this.indexes.length] +
            (Math.floor(scaleDegree / this.indexes.length) * 12) +
            (rootOct * 12);
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