import { Result, Union, Intersect, Constraint, ConstraintCheck, Brand, Failure } from './index';
import show from './show';
import { ValidationError } from './errors';

export type InnerValidateHelper = <T>(runtype: RuntypeBase<T>, value: unknown) => Result<T>;
declare const internalSymbol: unique symbol;
const internal: typeof internalSymbol = ('__internal__' as unknown) as typeof internalSymbol;
interface InternalValidation<A> {
  validate(
    x: any,
    innerValidate: <T>(runtype: RuntypeBase<T>, value: unknown) => Result<T>,
  ):
    | (Result<A> & { cycle?: false })
    | {
        success: true;
        cycle: true;
        placeholder: Partial<A>;
        populate: () => Result<A>;
      };
  guard?: (
    x: any,
    innerValidate: <T>(runtype: RuntypeBase<T>, value: unknown) => Failure | undefined,
  ) => Failure | undefined;
}
/**
 * A runtype determines at runtime whether a value conforms to a type specification.
 */
export interface RuntypeBase<A = unknown> {
  readonly tag: string;

  show?: (ctx: {
    needsParens: boolean;
    parenthesize: (str: string) => string;
    showChild: (rt: RuntypeBase, needsParens: boolean) => string;
  }) => string;

  [internal]: InternalValidation<A>;
}

/**
 * A runtype determines at runtime whether a value conforms to a type specification.
 */
export interface Runtype<A = unknown> extends RuntypeBase<A> {
  /**
   * Verifies that a value conforms to this runtype. When given a value that does
   * not conform to the runtype, throws an exception.
   */
  assert(x: any): asserts x is A;

  /**
   * Verifies that a value conforms to this runtype. If so, returns the same value,
   * statically typed. Otherwise throws an exception.
   */
  check(x: any): A;

  /**
   * A type guard for this runtype.
   */
  guard(x: any): x is A;

  /**
   * Validates that a value conforms to this type, and returns a result indicating
   * success or failure (does not throw).
   */
  validate(x: any): Result<A>;

  /**
   * Union this Runtype with another.
   */
  Or<B extends RuntypeBase>(B: B): Union<[this, B]>;

  /**
   * Intersect this Runtype with another.
   */
  And<B extends RuntypeBase>(B: B): Intersect<[this, B]>;

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
}

/**
 * Obtains the static type associated with a Runtype.
 */
export type Static<A extends RuntypeBase<any>> = A extends RuntypeBase<infer T> ? T : unknown;

export function create<TConfig extends RuntypeBase<any>>(
  internalImplementation:
    | InternalValidation<Static<TConfig>>
    | InternalValidation<Static<TConfig>>['validate'],
  config: Omit<
    TConfig,
    | 'assert'
    | 'check'
    | 'guard'
    | 'validate'
    | 'Or'
    | 'And'
    | 'withConstraint'
    | 'withGuard'
    | 'withBrand'
    | typeof internal
  >,
): TConfig {
  // A.check = check;
  // A.assert = (v: any) => {
  //   check(v);
  // };
  // A._innerValidate = (value: any, visited: VisitedState) => {
  //   if (visited.has(value, A)) return { success: true, value };
  //   return validate(value, visited);
  // };
  // A.validate = (value: any) => A._innerValidate(value, VisitedState());
  // A.guard = guard;
  // A.Or = Or;
  // A.And = And;
  // A.withConstraint = withConstraint;
  // A.withGuard = withGuard;
  // A.withBrand = withBrand;
  // A.reflect = A;
  // A.toString = () => `Runtype<${show(A)}>`;

  const A: Runtype<Static<TConfig>> = {
    ...config,
    assert,
    check,
    validate: (value: any) => innerValidate(A, value, new Map()),
    guard,
    Or,
    And,
    withConstraint,
    withGuard,
    withBrand,
    toString: () => `Runtype<${show(A)}>`,
    [internal]:
      typeof internalImplementation === 'function'
        ? {
            validate: internalImplementation,
          }
        : internalImplementation,
  };

  return (A as unknown) as TConfig;

  function assert(x: any): asserts x is Static<TConfig> {
    const validated = innerGuard(A, x, new Map());
    if (validated) {
      throw new ValidationError(validated.message, validated.key);
    }
  }
  function check(x: any) {
    const validated = A.validate(x);
    if (!validated.success) {
      throw new ValidationError(validated.message, validated.key);
    }
    return validated.value;
  }

  function guard(x: any): x is Static<TConfig> {
    const validated = innerGuard(A, x, new Map());
    return validated === undefined;
  }

  function Or<B extends RuntypeBase>(B: B): Union<[Runtype<Static<TConfig>>, B]> {
    return Union(A, B);
  }

  function And<B extends RuntypeBase>(B: B): Intersect<[Runtype<Static<TConfig>>, B]> {
    return Intersect(A, B);
  }

  function withConstraint<T extends Static<TConfig>, K = unknown>(
    constraint: ConstraintCheck<Runtype<Static<TConfig>>>,
    options?: { name?: string; args?: K },
  ): Constraint<Runtype<Static<TConfig>>, T, K> {
    return Constraint<Runtype<Static<TConfig>>, T, K>(A, constraint, options);
  }

  function withGuard<T extends Static<TConfig>, K = unknown>(
    guard: (x: Static<TConfig>) => x is T,
    options?: { name?: string; args?: K },
  ): Constraint<Runtype<Static<TConfig>>, T, K> {
    return Constraint<Runtype<Static<TConfig>>, T, K>(A, guard, options);
  }

  function withBrand<B extends string>(B: B): Brand<B, Runtype<Static<TConfig>>> {
    return Brand<B, Runtype<Static<TConfig>>>(B, A);
  }
}

export function createValidationPlaceholder<T>(
  placeholder: T,
  fn: (placehoder: T) => Failure | undefined,
): {
  success: true;
  cycle: true;
  placeholder: Partial<T>;
  populate: () => Result<T>;
} {
  return {
    success: true,
    cycle: true,
    placeholder,
    populate: () => {
      const result = fn(placeholder);
      if (result) {
        return result;
      }
      return { success: true, value: placeholder };
    },
  };
}

type VisitedState = Map<RuntypeBase<unknown>, Map<any, any>>;
function innerValidate<T>(
  targetType: RuntypeBase<T>,
  value: any,
  visited: VisitedState,
): Result<T> {
  const validator = targetType[internal];
  const cached = visited.get(targetType)?.get(value);
  if (cached !== undefined) {
    return { success: true, value: cached };
  }
  let result = validator.validate(value, (t, v) => innerValidate(t, v, visited));
  if (result.cycle) {
    const { placeholder, populate } = result;
    visited.set(targetType, (visited.get(targetType) || new Map()).set(value, placeholder));
    result = populate();
    if (result.success) {
      visited.set(targetType, (visited.get(targetType) || new Map()).set(value, result.value));
    }
  }
  return result;
}

function innerGuard(
  targetType: RuntypeBase,
  value: any,
  visited: Map<RuntypeBase, Set<any>>,
): Failure | undefined {
  const validator = targetType[internal];
  if (value && (typeof value === 'object' || typeof value === 'function')) {
    const cached = visited.get(targetType)?.has(value);
    if (cached) return undefined;
    visited.set(targetType, (visited.get(targetType) || new Set()).add(value));
  }
  if (validator.guard) {
    return validator.guard(value, (t, v) => innerGuard(t, v, visited));
  }
  let result = validator.validate(
    value,
    (t, v) => innerGuard(t, v, visited) || { success: true, value: v as any },
  );
  if (result.cycle) result = result.populate();
  if (result.success) return undefined;
  else return result;
}
