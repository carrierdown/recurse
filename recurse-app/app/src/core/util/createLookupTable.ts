import {TokenType} from "../../interpreter/TokenType";

export default function createLookupTable<T>(source: Array<any>, lookupKey: string, lookupValue: string): Array<T> {
    var expectTable: Array<T> = [];
    for (var i = 0; i < source.length; i++) {
        expectTable[source[i][lookupKey]] = source[i][lookupValue];
    }
    return expectTable;
}