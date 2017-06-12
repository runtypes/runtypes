import { Runtype, Rt, Static } from '../runtype';
export interface Custom<A extends Rt, T extends string, K> extends Runtype<Static<A>> {
    tag: T;
    underlying: A;
    args: K;
}
export declare function Custom<A extends Rt, T extends string, K>(underlying: A, constraint: (x: Static<A>, args: K) => boolean | string, tag: T, args: K): Custom<A, T, K>;
