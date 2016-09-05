import _ = require('lodash');
import INode from "../../interpreter/INode";
import Entity from "../../interpreter/Entity";

export default class Helpers {
    static ensureRange(val: number, min: number, max: number): number {
        if (val < min) return min;
        if (val > max) return max;
        return val;
    }

    static timeStringToSixteenths(timeString: string) {
        var timeValues: Array<string> = _.words(timeString, '.'),
            sixteenths: number,
            timeValuesAsInt: Array<number>;
        timeValuesAsInt = _.map(timeValues, function (val) {
            return parseInt(val, 10);
        });
        if (timeValues.length === 3 && _.every(timeValues, _.isNumber)) {
            sixteenths = timeValuesAsInt[0] * 16 + timeValuesAsInt[1] * 4 + timeValuesAsInt[2];
        }
        return sixteenths;
    }

    public static traverseNodes(nodes: INode[], callback: (node: INode, level: number, i: number, path: number[]) => void, level: number = 0, index: number = 0, path: number[] = []): void {
        level++;
        for (let i = 0; i < nodes.length; i++) {
            let newPath: number[] = _.clone(path);
            newPath.push(i);
            console.log('Invoking callback on node ' + Entity[nodes[i].type] + ' level ' + level + ' index ' + i + ' path: ', newPath);
            callback(nodes[i], level, i, newPath);
            Helpers.traverseNodes(nodes[i].children, callback, level, i, newPath);
        }
    }
}