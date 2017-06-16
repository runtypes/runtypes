import { Runtype, Rt, Static } from '../runtype';
export declare type ConstraintCheck<A extends Rt> = (x: Static<A>) => boolean | string;
export interface Constraint<A extends Rt, K extends {
    tag: string;
}> extends Runtype<Static<A>> {
    tag: 'constraint';
    underlying: A;
    constraint: ConstraintCheck<A>;
    args?: K;
}
export declare function Constraint<A extends Rt, K extends {
    tag: string;
}>(underlying: A, constraint: ConstraintCheck<A>, args?: K): Constraint<A, K>;
