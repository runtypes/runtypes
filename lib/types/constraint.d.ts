import { Runtype, Rt, Static } from '../runtype';
export interface Constraint<A extends Rt> extends Runtype<Static<A>> {
    tag: 'constraint';
    underlying: A;
}
export declare function Constraint<A extends Rt>(underlying: A, constraint: (x: A) => boolean | string): Constraint<A>;
