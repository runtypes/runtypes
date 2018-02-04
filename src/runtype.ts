import { Result, Union, Union2, Intersect, Intersect2, Constraint, ConstraintCheck } from './index';
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
   * Convert this to a Reflect, capable of introspecting the structure of the type.
   */
  reflect: Reflect;

  /* @internal */ _checkIncrementally: IncrementalChecker;

  /* @internal */ _falseWitness: A;
}

/**
 * Obtains the static type associated with a Runtype.
 */
export type Static<A extends Runtype> = A['_falseWitness'];

export function createIncremental<A extends Runtype>(checker: IncrementalChecker, A: any): A {
  A.check = (x: any) => {
    for (const err of checker(x)) if (err) throw new Error(err);
    return x;
  };
  A._checkIncrementally = checker;
  A.validate = validate;
  A.guard = guard;
  A.Or = Or;
  A.And = And;
  A.withConstraint = withConstraint;
  A.reflect = A;
  A.toString = () => `Runtype<${show(A)}>`;

  return A;

  function validate(value: any): Result<A> {
    try {
      A.check(value);
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
}

export function create<A extends Runtype>(check: (x: {}) => Static<A>, A: any): A {
  A.check = check;
  A._checkIncrementally = checkIncrementally;
  A.validate = validate;
  A.guard = guard;
  A.Or = Or;
  A.And = And;
  A.withConstraint = withConstraint;
  A.reflect = A;
  A.toString = () => `Runtype<${show(A)}>`;

  return A;

  function* checkIncrementally(value: any) {
    const result = validate(value);
    yield result.success ? undefined : result.message;
  }

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
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export function validationError(message: string) {
  return new ValidationError(message);
}

export type Problem = string;

export type IncrementalChecker = (x: any) => IterableIterator<Problem | undefined>;
