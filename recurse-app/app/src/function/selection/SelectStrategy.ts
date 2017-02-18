import {createLookupTable} from "../../core/util/createLookupTable";

export enum SelectStrategy {
    even,
    odd,
    first,
    last,
    every,
    indexList
}

/*export var SelectStrategyTable: Array<Function> = [
    selectEven,
    selectOdd,
    selectFirst,
    selectLast,
    selectEvery,
    selectByIndexList
];*/

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

export var SelectStrategyTable: Array<(numResults: number, indexList: Array<number>) => Array<number>> =
    createLookupTable<(numResults: number, indexList: Array<number>) => Array<number>>(selectStrategies, 'strategy', 'implementation');

function selectEven(numResults: number, indexList: Array<number> = []): Array<number> {
    var n: number = Math.floor(numResults / 2),
        result: Array<number> = [];

    for (var i = 0; i < n; i++) {
        result.push(i * 2 + 1);
    }
    return result;
}

function selectOdd(numResults: number, indexList: Array<number> = []): Array<number> {
    var n: number = Math.floor(numResults / 2),
        rem: number = numResults % 2,
        result: Array<number> = [];

    for (var i = 0; i < n + rem; i++) {
        result.push(i * 2);
    }
    return result;
}

function selectFirst(numResults: number, indexList: Array<number> = []): Array<number> {
    return (numResults > 0 ? [0] : []);
}

function selectLast(numResults: number, indexList: Array<number> = []): Array<number> {
    return (numResults > 0 ? [numResults - 1] : []);
}

function selectEvery(numResults: number, indexList: Array<number> = []) {
    //todo: impl

}

function selectByIndexList(numResults: number, indexList: Array<number> = []) {
    var results: Array<number> = [];

    if (indexList.length === 0) return;

    for (let index of indexList) {
        if (index > 0) {
            index--;
        } else {
            index = 0;
        }
        // only allow unique indexes within range
        if (index < numResults && results.indexOf(index) < 0) {
            results.push(index);
        }
    }
    return results;
}