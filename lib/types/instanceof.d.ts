import { Runtype } from "../runtype";
export interface IInstanceOfFunction extends Function {
}
export interface InstanceOf<V extends IInstanceOfFunction> extends Runtype<V> {
    tag: "instanceof";
    ctor: V;
}
export declare function InstanceOf<V extends IInstanceOfFunction>(ctor: V): InstanceOf<V>;
