import type * as t from '.';
// import { Union, Intersect, Constraint, ConstraintCheck, Brand, ParsedValue, ParsedValueConfig } from './index';
import type { Result, Failure } from './result';
import show from './show';
import { ValidationError } from './errors';
import { ParsedValueConfig } from './types/ParsedValue';
import showValue from './showValue';
import { failure, success } from './result';

// let Union: typeof t.Union;
// let Intersect: typeof t.Intersect;
// let Constraint: typeof t.Constraint;
// let Brand: typeof t.Brand;
// let ParsedValue: typeof t.ParsedValue;
// Importing these directly creates a cycle
interface Helpers {
  readonly Union: typeof t.Union;
  readonly Intersect: typeof t.Intersect;
  readonly Constraint: typeof t.Constraint;
  readonly Brand: typeof t.Brand;
  readonly ParsedValue: typeof t.ParsedValue;
}
let helpers: Helpers;
export function provideHelpers(h: Helpers) {
  helpers = h;
}

export type InnerValidateHelper = <T>(runtype: RuntypeBase<T>, value: unknown) => Result<T>;
declare const internalSymbol: unique symbol;
const internal: typeof internalSymbol =
  '__internal_runtype_methods__' as unknown as typeof internalSymbol;

export function assertRuntype(...values: RuntypeBase[]) {
  for (const value of values) {
    if (!value || !value[internal]) {
      throw new Error(`Expected Runtype but got ${showValue(value)}`);
    }
  }
}
export function isRuntype(value: unknown): value is RuntypeBase {
  return typeof value === 'object' && value != null && internal in value;
}

export type ResultWithCycle<T> = (Result<T> & { cycle?: false }) | Cycle<T>;

export type SealedState =
  | { readonly keysFromIntersect?: ReadonlySet<string>; readonly deep: boolean }
  | false;
export interface InternalValidation<TParsed> {
  /**
   * parse
   */
  p(
    x: any,
    innerValidate: <T>(runtype: RuntypeBase<T>, value: unknown, sealed?: SealedState) => Result<T>,
    innerValidateToPlaceholder: <T>(
      runtype: RuntypeBase<T>,
      value: unknown,
      sealed?: SealedState,
    ) => ResultWithCycle<T>,
    mode: 'p' | 's' | 't',
    sealed: SealedState,
  ): ResultWithCycle<TParsed>;
  /**
   * test
   */
  t?: (
    x: any,
    innerValidate: <T>(
      runtype: RuntypeBase<T>,
      value: unknown,
      sealed?: SealedState,
    ) => Failure | undefined,
    sealed: SealedState,
  ) => Failure | undefined;
  /**
   * serialize
   */
  s?: (
    // any is used here to ensure TypeScript still treats RuntypeBase as
    // covariant.
    x: any,
    innerSerialize: (runtype: RuntypeBase, value: unknown, sealed?: SealedState) => Result<any>,
    innerSerializeToPlaceholder: (
      runtype: RuntypeBase,
      value: unknown,
      sealed?: SealedState,
    ) => ResultWithCycle<any>,
    mode: 's',
    sealed: SealedState,
  ) => ResultWithCycle<any>;
  /**
   * get underlying type
   */
  u?: (mode: 'p' | 's' | 't') => RuntypeBase | undefined;

  /**
   * get fields, not called if "u" is implemented, can return
   * undefined to indicate that arbitrarily many fields are
   * possible.
   */
  f?: (mode: 'p' | 't' | 's') => ReadonlySet<string> | undefined;
}

/**
 * A runtype determines at runtime whether a value conforms to a type specification.
 */
export interface RuntypeBase<TParsed = unknown> {
  readonly tag: string;

  /**
   * Verifies that a value conforms to this runtype. When given a value that does
   * not conform to the runtype, throws an exception.
   *
   * @throws ValidationError
   */
  assert(x: any): asserts x is TParsed;

  /**
   * A type guard for this runtype.
   */
  test(x: any): x is TParsed;

  /**
   * Validates the value conforms to this type, and performs
   * the `parse` action for any `ParsedValue` types.
   *
   * If the value is valid, it returns the parsed value,
   * otherwise it throws a ValidationError.
   *
   * @throws ValidationError
   */
  parse(x: any): TParsed;

  /**
   * Validates the value conforms to this type, and performs
   * the `parse` action for any `ParsedValue` types.
   *
   * Returns a `Result`, constaining the parsed value or
   * error message. Does not throw!
   */
  safeParse(x: any): Result<TParsed>;

  show?: (needsParens: boolean) => string;

  [internal]: InternalValidation<TParsed>;
}

/**
 * A runtype determines at runtime whether a value conforms to a type specification.
 */
export interface Runtype<TParsed> extends RuntypeBase<TParsed> {
  /**
   * Union this Runtype with another.
   */
  Or<B extends RuntypeBase>(B: B): t.Union<[this, B]>;

  /**
   * Intersect this Runtype with another.
   */
  And<B extends RuntypeBase>(B: B): t.Intersect<[this, B]>;

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
    constraint: t.ConstraintCheck<this>,
    options?: { name?: string; args?: K },
  ): t.Constraint<this, T, K>;

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
  ): t.Constraint<this, T, K>;

  /**
   * Adds a brand to the type.
   */
  withBrand<B extends string>(brand: B): t.Brand<B, this>;

  /**
   * Apply conversion functions when parsing/serializing this value
   */
  withParser<TParsed>(value: ParsedValueConfig<this, TParsed>): t.ParsedValue<this, TParsed>;
}

export interface Codec<TParsed> extends Runtype<TParsed> {
  /**
   * Validates the value conforms to this type, and performs
   * the `serialize` action for any `ParsedValue` types.
   *
   * If the value is valid, and the type supports serialize,
   * it returns the serialized value, otherwise it throws a
   * ValidationError.
   *
   * @throws ValidationError
   */
  serialize: (x: TParsed) => unknown;
  /**
   * Validates the value conforms to this type, and performs
   * the `serialize` action for any `ParsedValue` types.
   *
   * Returns a `Result`, constaining the serialized value or
   * error message. Does not throw!
   */
  safeSerialize: (x: TParsed) => Result<unknown>;
}
/**
 * Obtains the static type associated with a Runtype.
 */
export type Static<A extends RuntypeBase<any>> = A extends RuntypeBase<infer T> ? T : unknown;

export function create<TConfig extends Codec<any>>(
  tag: TConfig['tag'],
  internalImplementation:
    | InternalValidation<Static<TConfig>>
    | InternalValidation<Static<TConfig>>['p'],
  config: Omit<
    TConfig,
    | typeof internal
    | 'tag'
    | 'assert'
    | 'test'
    | 'parse'
    | 'safeParse'
    | 'serialize'
    | 'safeSerialize'
    | 'Or'
    | 'And'
    | 'withConstraint'
    | 'withGuard'
    | 'withBrand'
    | 'withParser'
  >,
): TConfig {
  const A: Codec<Static<TConfig>> = {
    ...config,
    tag,
    assert(x: any): asserts x is Static<TConfig> {
      const validated = innerGuard(A, x, createGuardVisitedState(), false);
      if (validated) {
        throw new ValidationError(validated);
      }
    },
    parse,
    safeParse,
    test,
    serialize(x: any) {
      const validated = safeSerialize(x);
      if (!validated.success) {
        throw new ValidationError(validated);
      }
      return validated.value;
    },
    safeSerialize,
    Or: <B extends RuntypeBase>(B: B): t.Union<[Codec<Static<TConfig>>, B]> => helpers.Union(A, B),
    And: <B extends RuntypeBase>(B: B): t.Intersect<[Codec<Static<TConfig>>, B]> =>
      helpers.Intersect(A, B),
    withConstraint: <T extends Static<TConfig>, K = unknown>(
      constraint: t.ConstraintCheck<Codec<Static<TConfig>>>,
      options?: { name?: string; args?: K },
    ): t.Constraint<Codec<Static<TConfig>>, T, K> =>
      helpers.Constraint<Codec<Static<TConfig>>, T, K>(A, constraint, options),
    withGuard: <T extends Static<TConfig>, K = unknown>(
      test: (x: Static<TConfig>) => x is T,
      options?: { name?: string; args?: K },
    ): t.Constraint<Codec<Static<TConfig>>, T, K> =>
      helpers.Constraint<Codec<Static<TConfig>>, T, K>(A, test, options),
    withBrand: <B extends string>(B: B): t.Brand<B, Codec<Static<TConfig>>> =>
      helpers.Brand<B, Codec<Static<TConfig>>>(B, A),
    withParser: <TParsed>(
      config: ParsedValueConfig<Codec<Static<TConfig>>, TParsed>,
    ): t.ParsedValue<Codec<Static<TConfig>>, TParsed> => helpers.ParsedValue(A as any, config),
    toString: () => `Runtype<${show(A)}>`,
    [internal]:
      typeof internalImplementation === 'function'
        ? { p: internalImplementation }
        : internalImplementation,
  };

  return A as unknown as TConfig;

  function safeParse(x: any) {
    return innerValidate(A, x, createVisitedState(), false);
  }
  function safeSerialize(x: any) {
    return innerSerialize(A, x, createVisitedState(), false);
  }
  function parse(x: any) {
    const validated = safeParse(x);
    if (!validated.success) {
      throw new ValidationError(validated);
    }
    return validated.value;
  }

  function test(x: any): x is Static<TConfig> {
    const validated = innerGuard(A, x, createGuardVisitedState(), false);
    return validated === undefined;
  }
}

export type Cycle<T> = {
  success: true;
  cycle: true;
  placeholder: Partial<T>;
  unwrap: () => Result<T>;
};

function attemptMixin<T>(placeholder: any, value: T): Result<T> {
  if (placeholder === value) {
    return success(value);
  }
  if (Array.isArray(placeholder) && Array.isArray(value)) {
    placeholder.splice(0, placeholder.length, ...value);
    return success(placeholder as any);
  }
  if (
    placeholder &&
    typeof placeholder === 'object' &&
    !Array.isArray(placeholder) &&
    value &&
    typeof value === 'object' &&
    !Array.isArray(value)
  ) {
    Object.assign(placeholder, value);
    return success(placeholder);
  }
  return failure(
    `Cannot convert a value of type "${
      Array.isArray(placeholder) ? 'Array' : typeof placeholder
    }" into a value of type "${
      value === null ? 'null' : Array.isArray(value) ? 'Array' : typeof value
    }" when it contains cycles.`,
  );
}

/**
 * Get the underlying type of a runtype, if it is a wrapper around another type
 */
export function unwrapRuntype(t: RuntypeBase, mode: 'p' | 's' | 't'): RuntypeBase {
  const i = t[internal];
  const unwrapped = i.u ? i.u(mode) : undefined;
  if (unwrapped && unwrapped !== t) {
    return unwrapRuntype(unwrapped, mode);
  }
  return t;
}

export function createValidationPlaceholder<T>(
  placeholder: T,
  fn: (placeholder: T) => Failure | undefined,
): Cycle<T> {
  return innerMapValidationPlaceholder(placeholder, () => fn(placeholder) || success(placeholder));
}

export function mapValidationPlaceholder<T, S>(
  source: ResultWithCycle<T>,
  fn: (placeholder: T) => Result<S>,
  extraGuard?: RuntypeBase<S>,
): ResultWithCycle<S> {
  if (!source.success) return source;
  if (!source.cycle) {
    const result = fn(source.value);
    return (
      (result.success &&
        extraGuard &&
        innerGuard(extraGuard, result.value, createGuardVisitedState(), false)) ||
      result
    );
  }

  return innerMapValidationPlaceholder(
    Array.isArray(source.placeholder) ? [...source.placeholder] : { ...source.placeholder },
    () => source.unwrap(),
    fn,
    extraGuard,
  );
}

function innerMapValidationPlaceholder(
  placeholder: any,
  populate: () => Result<any>,
  fn?: (placeholder: any) => Result<any>,
  extraGuard?: RuntypeBase<any>,
): Cycle<any> {
  let hasCycle = false;
  let cache: Result<any> | undefined;
  const cycle: Cycle<any> = {
    success: true,
    cycle: true,
    placeholder,
    unwrap: () => {
      if (cache) {
        hasCycle = true;
        return cache;
      }
      cache = success(placeholder);

      const sourceResult = populate();
      const result = sourceResult.success && fn ? fn(sourceResult.value) : sourceResult;
      if (!result.success) return (cache = result);
      if (hasCycle) {
        const unwrapResult = attemptMixin(cache.value, result.value);
        const guardFailure =
          unwrapResult.success &&
          extraGuard &&
          innerGuard(extraGuard, unwrapResult.value, createGuardVisitedState(), false);
        cache = guardFailure || unwrapResult;
      } else {
        const guardFailure =
          extraGuard && innerGuard(extraGuard, result.value, createGuardVisitedState(), false);
        cache = guardFailure || result;
      }

      if (cache.success) {
        cycle.placeholder = cache.value;
      }

      return cache;
    },
  };
  return cycle;
}

declare const OpaqueVisitedState: unique symbol;
export type OpaqueVisitedState = typeof OpaqueVisitedState;
type VisitedState = Map<RuntypeBase<unknown>, Map<any, Cycle<any>>>;

function unwrapVisitedState(o: OpaqueVisitedState): VisitedState {
  return o as any;
}
function wrapVisitedState(o: VisitedState): OpaqueVisitedState {
  return o as any;
}

export function createVisitedState(): OpaqueVisitedState {
  return wrapVisitedState(new Map());
}

declare const OpaqueGuardVisitedState: unique symbol;
export type OpaqueGuardVisitedState = typeof OpaqueGuardVisitedState;
type GuardVisitedState = Map<RuntypeBase<unknown>, Set<any>>;

function unwrapGuardVisitedState(o: OpaqueGuardVisitedState): GuardVisitedState {
  return o as any;
}
function wrapGuardVisitedState(o: GuardVisitedState): OpaqueGuardVisitedState {
  return o as any;
}

export function createGuardVisitedState(): OpaqueGuardVisitedState {
  return wrapGuardVisitedState(new Map());
}

export function innerValidate<T>(
  targetType: RuntypeBase<T>,
  value: any,
  $visited: OpaqueVisitedState,
  sealed: SealedState,
): Result<T> {
  const result = innerValidateToPlaceholder(targetType, value, $visited, sealed);
  if (result.cycle) {
    return result.unwrap();
  }
  return result;
}

function innerValidateToPlaceholder<T>(
  targetType: RuntypeBase<T>,
  value: any,
  $visited: OpaqueVisitedState,
  sealed: SealedState,
): ResultWithCycle<T> {
  const visited = unwrapVisitedState($visited);
  const validator = targetType[internal];
  const cached = visited.get(targetType)?.get(value);
  if (cached !== undefined) {
    return cached;
  }
  const result = validator.p(
    value,
    (t, v, s) => innerValidate(t, v, $visited, s ?? sealed),
    (t, v, s) => innerValidateToPlaceholder(t, v, $visited, s ?? sealed),
    'p',
    sealed,
  );
  if (result.cycle) {
    visited.set(targetType, (visited.get(targetType) || new Map()).set(value, result));
    return result;
  }
  return result;
}

export function innerSerialize<T>(
  targetType: RuntypeBase<T>,
  value: any,
  $visited: OpaqueVisitedState,
  sealed: SealedState,
): Result<T> {
  const result = innerSerializeToPlaceholder(targetType, value, $visited, sealed);
  if (result.cycle) {
    return result.unwrap();
  }
  return result;
}
function innerSerializeToPlaceholder(
  targetType: RuntypeBase,
  value: any,
  $visited: OpaqueVisitedState,
  sealed: SealedState,
): ResultWithCycle<any> {
  const visited = unwrapVisitedState($visited);
  const validator = targetType[internal];
  const cached = visited.get(targetType)?.get(value);
  if (cached !== undefined) {
    return cached;
  }
  let result = (validator.s || validator.p)(
    value,
    (t, v, s) => innerSerialize(t, v, $visited, s ?? sealed),
    (t, v, s) => innerSerializeToPlaceholder(t, v, $visited, s ?? sealed),
    's',
    sealed,
  );
  if (result.cycle) {
    visited.set(targetType, (visited.get(targetType) || new Map()).set(value, result));
    return result;
  }
  return result;
}

export function innerGuard(
  targetType: RuntypeBase,
  value: any,
  $visited: OpaqueGuardVisitedState,
  sealed: SealedState,
): Failure | undefined {
  const visited = unwrapGuardVisitedState($visited);
  const validator = targetType[internal];
  if (value && (typeof value === 'object' || typeof value === 'function')) {
    const cached = visited.get(targetType)?.has(value);
    if (cached) return undefined;
    visited.set(targetType, (visited.get(targetType) || new Set()).add(value));
  }
  if (validator.t) {
    return validator.t(value, (t, v, s) => innerGuard(t, v, $visited, s ?? sealed), sealed);
  }
  let result = validator.p(
    value,
    (t, v, s) => innerGuard(t, v, $visited, s ?? sealed) || success(v as any),
    (t, v, s) => innerGuard(t, v, $visited, s ?? sealed) || success(v as any),
    't',
    sealed,
  );
  if (result.cycle) result = result.unwrap();
  if (result.success) return undefined;
  else return result;
}

/**
 * Get the possible fields for a runtype
 * Returns "undefined" if there can be arbitrary fields (e.g. Record<string, number>)
 */
export function getFields(t: RuntypeBase, mode: 'p' | 's' | 't'): ReadonlySet<string> | undefined {
  const b = unwrapRuntype(t, mode);
  const i = b[internal];
  return i.f ? i.f(mode) : undefined;
}
