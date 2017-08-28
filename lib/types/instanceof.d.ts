import { Runtype } from "../runtype";
export interface Constructor extends Function {
}
export interface InstanceOf<V extends Constructor> extends Runtype<V> {
    tag: "instanceof";
    ctor: V;
}
export declare function InstanceOf<V extends Constructor>(ctor: V): InstanceOf<V>;
