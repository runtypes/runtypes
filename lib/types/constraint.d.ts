import { Runtype, Rt, Static } from '../runtype';
export declare type ConstraintCheck<A extends Rt> = (x: Static<A>) => boolean | string;
export interface Constraint<A extends Rt, K> extends Runtype<Static<A>> {
    tag: 'constraint';
    underlying: A;
    constraint: ConstraintCheck<A>;
    args?: K;
}
export declare function Constraint<A extends Rt, K>(underlying: A, constraint: ConstraintCheck<A>, args?: K): Constraint<A, K>;
