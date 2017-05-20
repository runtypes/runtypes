import { Runtype, Rt, Static } from '../runtype';
export interface Constraint<A extends Rt> extends Runtype<Static<A>> {
    tag: 'constraint';
    underlying: A;
}
export declare type ConstraintCheck<T> = (x: T) => boolean | string;
export declare function Constraint<A extends Rt>(underlying: A, constraint: ConstraintCheck<A>): Constraint<A>;
