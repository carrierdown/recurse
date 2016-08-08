import tape = require('tape');

import Interpolate from './Interpolate';
import Value from "../base/Value";
import ValueType from "../../interpreter/ValueType";

tape('Testing sum', (test) => {
    let interpolate = new Interpolate();
    //interpolate.children.push(new Value(1, interpolate, ValueType.INTERVAL));
    //interpolate.children.push(new Value(4, interpolate, ValueType.INTERVAL));

    test.equal(interpolate.sum(1, 4, 4), 10, 'Sum of 1 to 4 over 4 steps should equal 10');
    console.log('1>4 0');
    interpolate.sum(1,4,0);
    console.log('1>4 1');
    interpolate.sum(1,4,1);
    console.log('1>4 2');
    interpolate.sum(1,4,2);
    console.log('1>4 3');
    interpolate.sum(1,4,3);
    test.end();
});