import IContext from "../../function/IContext";

export default function forEachPitch(context: IContext, process: {(index: number, pitch: number): number}): void {
    var ix: number,
        pix: number;

    for (ix = 0; ix < context.results.length; ix++) {
        for (pix = 0; pix < context.results[ix].pitches.length; pix++) {
            context.results[ix].pitches[pix] = process(ix, context.results[ix].pitches[pix]);
        }
    }
}