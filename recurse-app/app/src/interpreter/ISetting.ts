import {Entity} from "./Entity";
import {IContext} from "../function/IContext";

export interface ISetting {
    type: Entity;
    value: any;
    apply: (context: IContext) => void;
}