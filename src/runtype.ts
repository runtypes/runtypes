import {
  Result,
  Union,
  Union2,
  Intersect,
  Intersect2,
  Constraint,
  ConstraintCheck,
  Brand,
} from './index';
import { Reflect } from './reflect';
import show from './show';

/**
 * A runtype determines at runtime whether a value conforms to a type specification.
 */
export interface Runtype<A = any> {
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
  Or<B extends Runtype>(B: B): Union2<this, B>;

  /**
   * Intersect this Runtype with another.
   */
  And<B extends Runtype>(B: B): Intersect2<this, B>;

  /**
   * Provide a function which validates some arbitrary constraint,
   * returning true if the constraint is met, false if it failed
   * for some reason. May also return a string which indicates an
   * error and provides a descriptive message.
   */
  withConstraint<K>(constraint: ConstraintCheck<this>, args?: K): Constraint<this, K>;

  /**
   * Adds a brand to the type.
   */
  withBrand<B extends string>(brand: B): Brand<B, this>;

  /**
   * Convert this to a Reflect, capable of introspecting the structure of the type.
   */
  reflect: Reflect;

  /* @internal */ _falseWitness: A;
}

/**
 * Obtains the static type associated with a Runtype.
 */
export type Static<A extends Runtype> = A['_falseWitness'];

export function create<A extends Runtype>(check: (x: {}) => Static<A>, A: any): A {
  A.check = check;
  A.validate = validate;
  A.guard = guard;
  A.Or = Or;
  A.And = And;
  A.withConstraint = withConstraint;
  A.withBrand = withBrand;
  A.reflect = A;
  A.toString = () => `Runtype<${show(A)}>`;

  return A;

  function validate(value: any): Result<A> {
    try {
      check(value);
      return { success: true, value };
    } catch ({ message }) {
      return { success: false, message };
    }
  }

  function guard(x: any): x is A {
    return validate(x).success;
  }

  function Or<B extends Runtype>(B: B): Union2<A, B> {
    return Union(A, B);
  }

  function And<B extends Runtype>(B: B): Intersect2<A, B> {
    return Intersect(A, B);
  }

  function withConstraint<K>(constraint: ConstraintCheck<A>, args?: K): Constraint<A, K> {
    return Constraint(A, constraint, args);
  }

  function withBrand<B extends string>(B: B): Brand<B, A> {
    return Brand(B, A);
  }
}

export class ValidationError extends Error {
  key?: string;

  constructor(message: string, key?: string) {
    super(message);
    this.key = key;
  }
}

export function validationError(message: string, key?: string) {
  return new ValidationError(message, key);
}
