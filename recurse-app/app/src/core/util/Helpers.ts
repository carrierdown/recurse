import _ = require('lodash');

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
}