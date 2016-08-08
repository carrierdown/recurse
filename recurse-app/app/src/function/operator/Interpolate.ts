import INode from '../../interpreter/INode';
import Entity from '../../interpreter/Entity';
import IContext from '../../function/IContext';
import {IRecurseValue} from "../../core/type/IRecurseValue";
import ValueType from "../../interpreter/ValueType";

export default class Interpolate implements INode {
    public type: Entity = Entity.INTERPOLATE;
    public children: Array<INode>;
    public parent: INode;
    public totalSteps: number = 0;
    public currentStep: number = 0;
    public startValue: number = 0;
    public endValue: number = 0;
    public valueType: ValueType;

    constructor(parent: INode = null) {
        this.parent = parent;
        this.children = [];
    }

    public reset(): void {
        this.totalSteps = 0;
        this.currentStep = 0;
        //console.log('reset was called');
    }

    public generate(context: IContext): Array<IRecurseValue> {
        var generatedValue: number = 0;

        if (this.children.length !== 2) { // todo also check start+end values prolly
            console.log('TEMP ERROR: invalid params for Interpolate');
            return;
        }
        if (this.totalSteps === 0) {
            this.startValue = this.children[0].generate(context)[0].value;
            this.endValue = this.children[1].generate(context)[0].value;
            this.valueType = this.children[0].generate(context)[0].valueType;
        }

        let currentValue: number = 0;

        if (context.prePhase) {
            let prevSum = this.sum(this.startValue, this.endValue, this.totalSteps);
            this.totalSteps++;
            let currentSum = this.sum(this.startValue, this.endValue, this.totalSteps);
            generatedValue = currentSum - prevSum;
        } else {
            if (this.currentStep <= this.totalSteps) {
                generatedValue = this.getDelta(this.startValue, this.endValue, this.currentStep, this.totalSteps);
                this.currentStep++;
            } else {
                console.log('TEMP error - interpolate: currentStep is bigger than totalSteps');
            }
        }
        return [{value: generatedValue, valueType: this.valueType}];
    }

    private getDelta(start: number, end: number, currentStep: number, numSteps: number): number {
        if (numSteps === 0) {
            return 0;
        }
        if (numSteps === 1) {
            return start;
        }
        if (currentStep === 0) {
            return start;
        }
        if (currentStep === numSteps - 1) {
            return end;
        }

        let delta: number = (end - start) / (numSteps - 1.0);
        return start + (delta * currentStep);
    }

    // given start, end and numSteps: calculates the sum of interpolating from start to end
    public sum(start: number, end: number, numSteps: number): number {
        let sum: number = 0;
        for (let i = 0; i < numSteps; i++) {
            sum += this.getDelta(start, end, i, numSteps);
            //console.log(`Sum is ${sum}, getDelta is ${this.getDelta(start, end, i, numSteps)}`);
        }
        return sum;
    }
}