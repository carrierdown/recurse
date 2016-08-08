import IContext from '../function/IContext';
import Entity from "./Entity";

interface ISetting {
    type: Entity;
    value: any;
    apply: (context: IContext) => void;
}

export default ISetting;