import { Result, Union, Intersect, Constraint, ConstraintCheck, Brand, Failure } from './index';
import show from './show';
import { ValidationError } from './errors';
import { ParsedValue, ParsedValueConfig } from './types/ParsedValue';

export type InnerValidateHelper = <T>(runtype: RuntypeBase<T>, value: unknown) => Result<T>;
declare const internalSymbol: unique symbol;
const internal: typeof internalSymbol = ('__internal__' as unknown) as typeof internalSymbol;

export interface InternalValidationStrict<TParsed, TSerialized = TParsed> {
  validate(
    x: any,
    innerValidate: <T>(runtype: RuntypeBase<T>, value: unknown) => Result<T>,
  ):
    | (Result<TParsed> & { cycle?: false })
    | {
        success: true;
        cycle: true;
        placeholder: Partial<TParsed>;
        populate: () => Result<TParsed>;
      };
  test?: (
    x: any,
    innerValidate: <T>(runtype: RuntypeBase<T>, value: unknown) => Failure | undefined,
  ) => Failure | undefined;
  serialize?: (
    x: TParsed,
    innerSerialize: (runtype: RuntypeBase, value: unknown) => Result<any>,
  ) =>
    | (Result<TSerialized> & { cycle?: false })
    | {
        success: true;
        cycle: true;
        placeholder: Partial<TSerialized>;
        populate: () => Result<TSerialized>;
      };
}
export interface InternalValidation<TParsed> {
  validate(
    x: any,
    innerValidate: <T>(runtype: RuntypeBase<T>, value: unknown) => Result<T>,
  ):
    | (Result<TParsed> & { cycle?: false })
    | {
        success: true;
        cycle: true;
        placeholder: Partial<TParsed>;
        populate: () => Result<TParsed>;
      };
  test?: (
    x: any,
    innerValidate: <T>(runtype: RuntypeBase<T>, value: unknown) => Failure | undefined,
  ) => Failure | undefined;
  serialize?: (
    x: any,
    innerSerialize: (runtype: RuntypeBase, value: unknown) => Result<any>,
  ) =>
    | (Result<any> & { cycle?: false })
    | {
        success: true;
        cycle: true;
        placeholder: Partial<any>;
        populate: () => Result<any>;
      };
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
export interface Runtype<TParsed> extends RuntypeBase<TParsed> {
  /**
   * Verifies that a value conforms to this runtype. When given a value that does
   * not conform to the runtype, throws an exception.
   */
  assert(x: any): asserts x is TParsed;

  /**
   * A type guard for this runtype.
   */
  test(x: any): x is TParsed;

  /**
   * @deprecated use Runtype.test
   */
  guard(x: any): x is TParsed;

  /**
   * Verifies that a value conforms to this runtype. If so, returns the same value,
   * statically typed. Otherwise throws an exception.
   */
  parse(x: any): TParsed;

  /**
   * @deprecated use Runtype.parse
   */
  check(x: any): TParsed;

  /**
   * Validates that a value conforms to this type, and returns a result indicating
   * success or failure (does not throw).
   */
  safeParse(x: any): Result<TParsed>;

  /**
   * @deprecated use Runtype.safeParse
   */
  validate(x: any): Result<TParsed>;

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
   * the type of the test function.
   *
   * @template T - Typically inferred from the return type of the type guard
   * function, so usually not needed to specify manually.
   * @param {(x: Static<this>) => x is T} test - Type test function (see
   * https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards)
   *
   * @param [options]
   * @param {string} [options.name] - allows setting the name of this
   * constrained runtype, which is helpful in reflection or diagnostic
   * use-cases.
   */
  withGuard<T extends Static<this>, K = unknown>(
    test: (x: Static<this>) => x is T,
    options?: { name?: string; args?: K },
  ): Constraint<this, T, K>;

  /**
   * Adds a brand to the type.
   */
  withBrand<B extends string>(brand: B): Brand<B, this>;

  /**
   * Apply conversion functions when parsing/serializing this value
   */
  withParser<TParsed>(value: ParsedValueConfig<this, TParsed>): ParsedValue<this, TParsed>;
}

export interface Codec<TParsed, TSerialized = TParsed> extends Runtype<TParsed> {
  serialize: (x: TParsed) => TSerialized;
  safeSerialize: (x: TParsed) => Result<TSerialized>;
}
/**
 * Obtains the static type associated with a Runtype.
 */
export type Static<A extends RuntypeBase<any>> = A extends RuntypeBase<infer T> ? T : unknown;

export function create<TConfig extends Codec<any, any>>(
  internalImplementation:
    | InternalValidation<Static<TConfig>>
    | InternalValidation<Static<TConfig>>['validate'],
  config: Omit<
    TConfig,
    | 'assert'
    | 'check'
    | 'test'
    | 'guard'
    | 'parse'
    | 'check'
    | 'safeParse'
    | 'validate'
    | 'serialize'
    | 'safeSerialize'
    | 'Or'
    | 'And'
    | 'withConstraint'
    | 'withGuard'
    | 'withBrand'
    | 'withParser'
    | typeof internal
  >,
): TConfig {
  const A: Codec<Static<TConfig>> = {
    ...config,
    assert,
    parse,
    check: parse,
    safeParse,
    validate: safeParse,
    test,
    guard: test,
    serialize,
    safeSerialize,
    Or,
    And,
    withConstraint,
    withGuard,
    withBrand,
    withParser,
    toString: () => `Runtype<${show(A)}>`,
    [internal]:
      typeof internalImplementation === 'function'
        ? {
            validate: internalImplementation,
          }
        : internalImplementation,
  };

  return (A as unknown) as TConfig;

  function safeParse(x: any) {
    return innerValidate(A, x, new Map());
  }
  function safeSerialize(x: any) {
    return innerSerialize(A, x, new Map());
  }
  function parse(x: any) {
    const validated = safeParse(x);
    if (!validated.success) {
      throw new ValidationError(validated.message, validated.key);
    }
    return validated.value;
  }
  function serialize(x: any) {
    const validated = safeSerialize(x);
    if (!validated.success) {
      throw new ValidationError(validated.message, validated.key);
    }
    return validated.value;
  }

  function assert(x: any): asserts x is Static<TConfig> {
    const validated = innerGuard(A, x, new Map());
    if (validated) {
      throw new ValidationError(validated.message, validated.key);
    }
  }
  function test(x: any): x is Static<TConfig> {
    const validated = innerGuard(A, x, new Map());
    return validated === undefined;
  }

  function Or<B extends RuntypeBase>(B: B): Union<[Codec<Static<TConfig>>, B]> {
    return Union(A, B);
  }

  function And<B extends RuntypeBase>(B: B): Intersect<[Codec<Static<TConfig>>, B]> {
    return Intersect(A, B);
  }

  function withConstraint<T extends Static<TConfig>, K = unknown>(
    constraint: ConstraintCheck<Codec<Static<TConfig>>>,
    options?: { name?: string; args?: K },
  ): Constraint<Codec<Static<TConfig>>, T, K> {
    return Constraint<Codec<Static<TConfig>>, T, K>(A, constraint, options);
  }

  function withGuard<T extends Static<TConfig>, K = unknown>(
    test: (x: Static<TConfig>) => x is T,
    options?: { name?: string; args?: K },
  ): Constraint<Codec<Static<TConfig>>, T, K> {
    return Constraint<Codec<Static<TConfig>>, T, K>(A, test, options);
  }

  function withBrand<B extends string>(B: B): Brand<B, Codec<Static<TConfig>>> {
    return Brand<B, Codec<Static<TConfig>>>(B, A);
  }

  function withParser<TParsed>(
    config: ParsedValueConfig<Codec<Static<TConfig>>, TParsed>,
  ): ParsedValue<Codec<Static<TConfig>>, TParsed> {
    return ParsedValue(A as any, config);
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
export function innerValidate<T>(
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

export function innerGuard(
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
  if (validator.test) {
    return validator.test(value, (t, v) => innerGuard(t, v, visited));
  }
  let result = validator.validate(
    value,
    (t, v) => innerGuard(t, v, visited) || { success: true, value: v as any },
  );
  if (result.cycle) result = result.populate();
  if (result.success) return undefined;
  else return result;
}

export function innerSerialize(
  targetType: RuntypeBase,
  value: any,
  visited: VisitedState,
): Result<any> {
  const validator = targetType[internal];
  const cached = visited.get(targetType)?.get(value);
  if (cached !== undefined) {
    return { success: true, value: cached };
  }
  let result = (validator.serialize || validator.validate)(value, (t, v) =>
    innerSerialize(t, v, visited),
  );
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
