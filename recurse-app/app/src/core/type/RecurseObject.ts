import {INode} from "../../interpreter/INode";

export class RecurseObject {
    public interval: number;
    public pitches: number[];
    public order: number;
    public velocity: number; // might be useful to have multiple velos for e.g. chords
    public duration: number;
    public postRest: number; // to simplify subsequent processing of events (i.e. in selections), we merge ROs having isRest=true with nearest left neighbour
    public preRest: number;
    public refToGenNode: INode;
    public level: number; // todo: to be implemented - needed for e.g. selecting on levels, i.e. select level 2 for nested intervals only.

    constructor(interval: number = 0, pitches: number[] = [], order: number = -1, velocity: number = void 0, duration: number = 0.25, preRest: number = 0, postRest: number = 0) {
        this.interval = interval;
        this.pitches = pitches;
        this.order = order;
        this.velocity = velocity;
        this.duration = duration;
        this.preRest = preRest;
        this.postRest = postRest;
    }

    public static getInstanceFromIntervalWithRests(interval: number, preRest: number, postRest: number): RecurseObject {
        return new RecurseObject(interval, [], -1, void 0, 0.25, preRest, postRest);
    }

    public static getInstanceFromInterval(interval: number): RecurseObject {
        return new RecurseObject(interval);
    }

    //static getInstanceFromNoteArray()

    /*
     public noteEvents: Array<NoteEvent> = [];
     private cursorPosition: NoteEvent;
     private static noteEventsStringTemplate = _.template('<% _.forEach(noteEvents, function(noteEvent) { %><%- noteEvent %>\n<% }); %>');

     constructor() {
     this.cursorPosition = NoteEvent.getDefaultInstance();
     }

     static createNew(): RecurseObject {
     return new RecurseObject();
     }


     private addEvent(event: NoteEvent): void {
     this.noteEvents.push(this.cursorPosition.clone());
     this.cursorPosition.add(event);
     }

     addInterval(interval: number): RecurseObject {
     var noteEvent = NoteEvent.getDefaultInstance();
     noteEvent.addSixteenths(interval);
     this.addEvent(noteEvent);
     return this;
     }

     toString():string {
     return RecurseObject.noteEventsStringTemplate(this);
     }
     */

    /*        private cloneLatestNoteEventOrDefault():NoteEvent {
     return this.noteEvents.length > 0 ? this.noteEvents[this.noteEvents.length - 1].clone() : recurse.core.types.NoteEvent.getDefaultInstance();
     }
     rep(interval: number, numRepeats: number): RecurseObject {
     var noteInterval: NoteInterval = NoteInterval.getDefaultInstance(),
     i: number,
     noteEvent: NoteEvent;

     noteInterval.addSixteenths(interval);
     noteInterval.divideBy(numRepeats);

     for (i = 0; i < numRepeats; i++) {
     noteEvent = NoteEvent.getDefaultInstance();
     noteEvent.addFraction(noteInterval.getFractionalTime());
     this.addEvent(noteEvent);
     }
     return this;
     }

     nestedItvl(interval: number, ...nestedIntervals: Array<number>): RecurseObject {
     var noteInterval: NoteInterval = NoteInterval.getDefaultInstance(),
     noteEvent: NoteEvent;

     if (nestedIntervals.length < 2) {
     return this;
     }

     noteInterval.addSixteenths(interval);
     noteInterval.divideBy(_.sum(nestedIntervals));
     _.forEach(nestedIntervals, (nestedInterval: number) => {
     noteEvent = NoteEvent.getDefaultInstance();
     noteEvent.addFraction(noteInterval.getFractionalTime() * nestedInterval);
     this.addEvent(noteEvent);
     });

     return this;
     }

     // some proof-of-concept for how generation might work with recursive structures as well

     rm(...intervals: Array<number>) {
     var flattened = _.flatten(intervals, true);
     console.log(flattened);
     }

     static interval1(interval: number):Array<any> {
     return [1,2,3];
     }

     static interval2(interval: number):Array<any> {
     return [4,[2,2],5,6,8,[2,4,2]];
     }*/
}