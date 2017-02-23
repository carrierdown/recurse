import {createLookupTable} from "../../core/util/createLookupTable";

export enum SelectStrategy {
    even,
    odd,
    first,
    last,
    every,
    indexList
}

var selectStrategies = [
    {
        strategy: SelectStrategy.even,
        implementation: selectEven
    },
    {
        strategy: SelectStrategy.odd,
        implementation: selectOdd
    },
    {
        strategy: SelectStrategy.first,
        implementation: selectFirst
    },
    {
        strategy: SelectStrategy.last,
        implementation: selectLast
    },
    {
        strategy: SelectStrategy.every,
        implementation: selectEvery
    },
    {
        strategy: SelectStrategy.indexList,
        implementation: selectByIndexList
    },
];

export var SelectStrategyTable: Array<(selectionIndices: number[], indexList: number[]) => number[]> =
    createLookupTable<(selectionIndices: number[], indexList: number[]) => number[]>(selectStrategies, 'strategy', 'implementation');

function selectEven(selectionIndices: number[], indexList: number[] = []): number[] {
    var n: number = Math.floor(selectionIndices.length / 2),
        result: number[] = [];

    for (var i = 0; i < n; i++) {
        let ix = i * 2 + 1;
        if (ix >= selectionIndices.length) {
            throw new Error("Selection index is outside of range");
        }
        result.push(selectionIndices[ix]);
    }
    return result;
}

function selectOdd(selectionIndices: number[], indexList: number[] = []): number[] {
    var n: number = Math.floor(selectionIndices.length / 2),
        rem: number = selectionIndices.length % 2,
        result: number[] = [];

    for (var i = 0; i < n + rem; i++) {
        let ix = i * 2;
        if (ix >= selectionIndices.length) {
            throw new Error("Selection index is outside of range");
        }
        result.push(selectionIndices[ix]);
    }
    return result;
}

function selectFirst(selectionIndices: number[], indexList: number[] = []): number[] {
    return (selectionIndices.length > 0 ? [selectionIndices[0]] : []);
}

function selectLast(selectionIndices: number[], indexList: number[] = []): number[] {
    return (selectionIndices.length > 0 ? [selectionIndices[selectionIndices.length - 1]] : []);
}

function selectEvery(selectionIndices: number[], indexList: number[] = []) {
    //todo: impl

}

function selectByIndexList(selectionIndices: number[], indexList: number[] = []) {
    var results: number[] = [];

    if (indexList.length === 0) return;

    for (let index of indexList) {
        if (index > 0) {
            index--; // convert to zero-based index
        } else {
            index = 0; // sanity
        }
        // only allow unique indexes within range
        if (index < selectionIndices.length && results.indexOf(selectionIndices[index]) < 0) {
            results.push(selectionIndices[index]);
        }
    }
    return results;
}