import IContext from "../../function/IContext";

export default function forEachSelectedPitch(context: IContext, process: {(index: number, pitch: number): number}): void {
    if (!context.selectionActive) {
        return;
    }

    for (let ix = 0; ix < context.selectedIndexes.length; ix++) {
        for (let pix = 0; pix < context.results[context.selectedIndexes[ix]].pitches.length; pix++) {
            context.results[context.selectedIndexes[ix]].pitches[pix] = process(ix, context.results[context.selectedIndexes[ix]].pitches[pix]);
        }
    }
}