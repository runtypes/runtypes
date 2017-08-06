import { Result, Union2, Intersect2, Constraint, ConstraintCheck } from './index';
import { Reflect } from './reflect';
/**
 * A runtype determines at runtime whether a value conforms to a type specification.
 */
export interface Runtype<A> {
    /**
     * Verifies that a value conforms to this runtype. If so, returns the same value,
     * statically typed. Otherwise throws an exception.
     */
    check(x: any): A;
    /**
     * Validates that a value conforms to this type, and returns a result indicating
     * success or failure (does not throw).
     */
    validate(x: any): Result<A>;
    /**
     * A type guard for this runtype.
     */
    guard(x: any): x is A;
    /**
     * Union this Runtype with another.
     */
    Or<B extends Rt>(B: B): Union2<this, B>;
    /**
     * Intersect this Runtype with another.
     */
    And<B extends Rt>(B: B): Intersect2<this, B>;
    /**
     * Provide a function which validates some arbitrary constraint,
     * returning true if the constraint is met, false if it failed
     * for some reason. May also return a string which indicates an
     * error and provides a descriptive message.
     */
    withConstraint<K>(constraint: ConstraintCheck<this>, args?: K): Constraint<this, K>;
    /**
     * Convert this to a Reflect, capable of introspecting the structure of the type.
     */
    reflect: Reflect;
    _falseWitness: A;
}
/**
 * Just a convenient synonym for internal use in defining new Runtypes.
 */
export declare type Rt = Runtype<any>;
/**
 * Obtains the static type associated with a Runtype.
 */
export declare type Static<A extends Rt> = A['_falseWitness'];
export declare function create<A extends Rt>(check: (x: {}) => Static<A>, A: any): A;
export declare class ValidationError extends Error {
    constructor(message: string);
}
export declare function validationError(message: string): ValidationError;
