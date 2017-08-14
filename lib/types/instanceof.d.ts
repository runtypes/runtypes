import { Runtype } from "../runtype";
export interface InstanceOf<V> extends Runtype<V> {
    tag: "instanceof";
    ctor: V;
}
export declare function InstanceOf<V extends Function>(ctor: V): InstanceOf<V>;
