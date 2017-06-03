import { Runtype, Rt, Static } from '../runtype';
export declare type ConstraintCheck<T> = (x: T) => boolean | string;
export declare type ConstraintCorrection<T> = (x: T) => T;
export declare type ConstraintRightInverse<T> = (x: T) => T;
export interface Constraint<A extends Rt> extends Runtype<Static<A>> {
    tag: 'constraint';
    underlying: A;
    constraint: ConstraintCheck<A>;
    correction?: ConstraintCorrection<A>;
    rightInverse?: ConstraintRightInverse<A>;
}
export declare function Constraint<A extends Rt>(underlying: A, constraint: ConstraintCheck<A>, correction?: ConstraintCorrection<A>, rightInverse?: ConstraintRightInverse<A>): Constraint<A>;
