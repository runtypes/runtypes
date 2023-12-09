import { ValidationError } from './errors';
import {
  Brand,
  Constraint,
  ConstraintCheck,
  Intersect,
  Null,
  Optional,
  Result,
  Transform,
  Transformer,
  Union,
} from './index';
import { Reflect } from './reflect';
import show from './show';
import { SUCCESS, hasKey } from './util';

const RuntypeSymbol: unique symbol = Symbol();

export const isRuntype = (x: any): x is RuntypeBase<unknown> => hasKey(RuntypeSymbol, x);

/**
 * A runtype determines at runtime whether a value conforms to a type specification.
 */
export interface RuntypeBase<A = unknown, C = A> {
  /**
   * Verifies that a value conforms to this runtype. If so, returns the same value,
   * statically typed. Otherwise throws an exception.
   */
  check(x: any): C;

  /**
   * Validates that a value conforms to this type, and returns a result indicating
   * success or failure (does not throw).
   */
  validate(x: any): Result<C>;

  /**
   * A type guard for this runtype.
   */
  guard(x: any): x is A;

  /**
   * Verifies that a value conforms to this runtype. When given a value that does
   * not conform to the runtype, throws an exception.
   */
  assert(x: any): asserts x is A;

  /**
   * Convert this to a Reflect, capable of introspecting the structure of the type.
   */
  readonly reflect: Reflect;

  /* @internal */ readonly _falseWitness: C;
  /* @internal */ readonly [RuntypeSymbol]: true;
}

/**
 * A runtype determines at runtime whether a value conforms to a type specification.
 */
export interface Runtype<A = unknown, C = A> extends RuntypeBase<A, C> {
  /**
   * Union this Runtype with another.
   */
  Or<B extends RuntypeBase>(B: B): Union<[this, B]>;

  /**
   * Intersect this Runtype with another.
   */
  And<B extends RuntypeBase>(B: B): Intersect<[this, B]>;

  /**
   * Optionalize this Runtype.
   */
  optional(): Optional<this>;

  /**
   * Union this Runtype with `Null`.
   */
  nullable(): Union<[this, typeof Null]>;

  /**
   * Use an arbitrary constraint function to validate a runtype, and optionally
   * to change its name and/or its static type.
   *
   * @template T - Optionally override the static type of the resulting runtype
   * @param {(x: Static<this>) => boolean | string} constraint - Custom function
   * that returns `true` if the constraint is satisfied, `false` or a custom
   * error message if not.
   * @param [options]
   * @param {string} [options.name] - allows setting the name of this
   * constrained runtype, which is helpful in reflection or diagnostic
   * use-cases.
   */
  withConstraint<T extends Static<this>, K = unknown>(
    constraint: ConstraintCheck<this>,
    options?: { name?: string; args?: K },
  ): Constraint<this, T, K>;

  /**
   * Helper function to convert an underlying Runtype into another static type
   * via a type guard function.  The static type of the runtype is inferred from
   * the type of the guard function.
   *
   * @template T - Typically inferred from the return type of the type guard
   * function, so usually not needed to specify manually.
   * @param {(x: Static<this>) => x is T} guard - Type guard function (see
   * https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards)
   *
   * @param [options]
   * @param {string} [options.name] - allows setting the name of this
   * constrained runtype, which is helpful in reflection or diagnostic
   * use-cases.
   */
  withGuard<T extends Static<this>, K = unknown>(
    guard: (x: Static<this>) => x is T,
    options?: { name?: string; args?: K },
  ): Constraint<this, T, K>;

  /**
   * Adds a brand to the type.
   */
  withBrand<B extends string>(brand: B): Brand<B, this>;

  /**
   * Transforms the validated value into another value.
   */
  withTransform<A extends this, B>(transformer: Transformer<A, B>): Transform<A, B>;
}

/**
 * Obtains the static type associated with a Runtype.
 */
export type Static<A extends RuntypeBase> = A['_falseWitness'];

export function create<A extends RuntypeBase>(
  validate: (x: any, visited: VisitedState) => Result<Static<A>>,
  A: any,
): A {
  A[RuntypeSymbol] = true;
  A.check = check;
  A.assert = check;
  A._innerValidate = (value: any, visited: VisitedState) => {
    if (visited.has(value, A)) return SUCCESS(value);
    return validate(value, visited);
  };
  A.validate = (value: any) => A._innerValidate(value, VisitedState());
  A.guard = guard;
  A.Or = Or;
  A.And = And;
  A.optional = optional;
  A.nullable = nullable;
  A.withConstraint = withConstraint;
  A.withGuard = withGuard;
  A.withBrand = withBrand;
  A.withTransform = withTransform;
  A.reflect = A;
  A.toString = () => `Runtype<${show(A)}>`;

  return A;

  function check(x: any) {
    const result: Result<unknown> = A.validate(x);
    if (result.success) return result.value;
    else throw new ValidationError(result);
  }

  function guard(x: any): x is A {
    return A.validate(x).success;
  }

  function Or<B extends Runtype>(B: B): Union<[A, B]> {
    return Union(A, B);
  }

  function And<B extends Runtype>(B: B): Intersect<[A, B]> {
    return Intersect(A, B);
  }

  function optional(): Optional<A> {
    return Optional(A);
  }

  function nullable(): Union<[A, typeof Null]> {
    return Union(A, Null);
  }

  function withConstraint<T extends Static<A>, K = unknown>(
    constraint: ConstraintCheck<A>,
    options?: { name?: string; args?: K },
  ): Constraint<A, T, K> {
    return Constraint<A, T, K>(A, constraint, options);
  }

  function withGuard<T extends Static<A>, K = unknown>(
    guard: (x: Static<A>) => x is T,
    options?: { name?: string; args?: K },
  ): Constraint<A, T, K> {
    return Constraint<A, T, K>(A, guard, options);
  }

  function withBrand<B extends string>(B: B): Brand<B, A> {
    return Brand(B, A);
  }

  function withTransform<B>(transformer: Transformer<A, B>): Transform<A, B> {
    return Transform(A, transformer);
  }
}

export function innerValidate<A extends RuntypeBase>(
  targetType: A,
  value: any,
  visited: VisitedState,
): Result<Static<A>> {
  return (targetType as any)._innerValidate(value, visited);
}

export type VisitedState = {
  has: (candidate: object, type: RuntypeBase) => boolean;
};
function VisitedState(): VisitedState {
  const members: WeakMap<object, WeakMap<RuntypeBase, true>> = new WeakMap();

  const add = (candidate: object, type: RuntypeBase) => {
    if (candidate === null || !(typeof candidate === 'object')) return;
    const typeSet = members.get(candidate);
    members.set(
      candidate,
      typeSet
        ? typeSet.set(type, true)
        : (new WeakMap() as WeakMap<RuntypeBase, true>).set(type, true),
    );
  };

  const has = (candidate: object, type: RuntypeBase) => {
    const typeSet = members.get(candidate);
    const value = (typeSet && typeSet.get(type)) || false;
    add(candidate, type);
    return value;
  };

  return { has };
}
