import {
  Codec,
  Static,
  create,
  RuntypeBase,
  InnerValidateHelper,
  innerValidate,
  createVisitedState,
  OpaqueVisitedState,
  assertRuntype,
} from '../runtype';
import show, { parenthesize } from '../show';
import { LiteralValue, isLiteralRuntype } from './literal';
import { lazyValue, isLazyRuntype } from './lazy';
import { isObjectRuntype } from './Object';
import {
  andError,
  expected,
  failure,
  FullError,
  Result,
  success,
  typesAreNotCompatible,
  unableToAssign,
} from '../result';
import { isTupleRuntype } from './tuple';
import { isBrandRuntype } from './brand';
import { isConstraintRuntype } from './constraint';
import { isParsedValueRuntype } from './ParsedValue';
import { Never } from '..';
import showValue from '../showValue';
import { isIntersectRuntype } from './intersect';
import { isNamedRuntype } from './Named';

export type StaticUnion<TAlternatives extends readonly RuntypeBase<unknown>[]> = {
  [key in keyof TAlternatives]: TAlternatives[key] extends RuntypeBase<unknown>
    ? Static<TAlternatives[key]>
    : unknown;
}[number];

export interface Union<TAlternatives extends readonly RuntypeBase<unknown>[]>
  extends Codec<StaticUnion<TAlternatives>> {
  readonly tag: 'union';
  readonly alternatives: TAlternatives;
  match: Match<TAlternatives>;
}

export function isUnionType(runtype: RuntypeBase): runtype is Union<RuntypeBase<unknown>[]> {
  return 'tag' in runtype && (runtype as Union<RuntypeBase<unknown>[]>).tag === 'union';
}

function resolveUnderlyingType(runtype: RuntypeBase, mode: 'p' | 's' | 't'): RuntypeBase {
  if (isLazyRuntype(runtype)) return resolveUnderlyingType(runtype.underlying(), mode);
  if (isBrandRuntype(runtype)) return resolveUnderlyingType(runtype.entity, mode);
  if (isConstraintRuntype(runtype)) return resolveUnderlyingType(runtype.underlying, mode);
  if (isNamedRuntype(runtype)) return resolveUnderlyingType(runtype.underlying, mode);

  if (mode === 'p' && isParsedValueRuntype(runtype))
    return resolveUnderlyingType(runtype.underlying, mode);
  if (mode === 't' && isParsedValueRuntype(runtype)) {
    return runtype.config.test ? resolveUnderlyingType(runtype.config.test, mode) : Never;
  }
  if (mode === 's' && isParsedValueRuntype(runtype)) {
    if (!runtype.config.serialize) {
      // this node can never match
      return Never;
    }
    return runtype.config.test ? resolveUnderlyingType(runtype.config.test, mode) : runtype;
  }

  return runtype;
}

function mapGet<TKey, TValue>(map: Map<TKey, TValue>) {
  return (key: TKey, fn: () => TValue) => {
    const existing = map.get(key);
    if (existing !== undefined) return existing;
    const fresh = fn();
    map.set(key, fresh);
    return fresh;
  };
}

function findFields<TResult>(
  alternative: RuntypeBase<TResult>,
  mode: 'p' | 's' | 't',
): [string, RuntypeBase][] {
  const underlying = resolveUnderlyingType(alternative, mode);
  const fields: [string, RuntypeBase][] = [];
  const pushField = (fieldName: string, type: RuntypeBase) => {
    const f = resolveUnderlyingType(type, mode);
    if (isUnionType(f)) {
      for (const type of f.alternatives) {
        pushField(fieldName, type);
      }
    } else {
      fields.push([fieldName, f]);
    }
  };
  if (isObjectRuntype(underlying) && !underlying.isPartial) {
    for (const fieldName of Object.keys(underlying.fields)) {
      pushField(fieldName, underlying.fields[fieldName]);
    }
  }
  if (isTupleRuntype(underlying)) {
    underlying.components.forEach((type, i) => {
      pushField(`${i}`, type);
    });
  }
  if (isIntersectRuntype(underlying)) {
    for (const type of underlying.intersectees) {
      fields.push(...findFields(type, mode));
    }
  }
  return fields;
}

function intersect<T>(sets: Set<T>[]) {
  const result = new Set(sets[0]);
  for (const s of sets) {
    for (const v of result) {
      if (!s.has(v)) {
        result.delete(v);
      }
    }
  }
  return result;
}
function findDiscriminator<TResult>(
  recordAlternatives: readonly (readonly [RuntypeBase<TResult>, [string, RuntypeBase][]])[],
) {
  const commonFieldNames = intersect(
    recordAlternatives.map(([, fields]) => new Set(fields.map(([fieldName]) => fieldName))),
  );
  const commonLiteralFields = new Map<string, Map<LiteralValue, RuntypeBase<TResult>>>(
    // we want to always check these props first, in case there are multiple possible keys
    // that can be used to discriminate
    ['type', 'kind', 'tag', 'version'].map(fieldName => [fieldName, new Map()]),
  );
  for (const [type, fields] of recordAlternatives) {
    for (const [fieldName, field] of fields) {
      if (isLiteralRuntype(field)) {
        const fieldTypes = mapGet(commonLiteralFields)(fieldName, () => new Map());
        if (fieldTypes.has(field.value)) {
          commonFieldNames.delete(fieldName);
        } else {
          fieldTypes.set(field.value, type);
        }
      } else {
        commonFieldNames.delete(fieldName);
      }
    }
  }
  for (const [fieldName, fieldTypes] of commonLiteralFields) {
    if (commonFieldNames.has(fieldName)) {
      return [fieldName, fieldTypes] as const;
    }
  }
}

/**
 * Construct a union runtype from runtypes for its alternatives.
 */
export function Union<
  TAlternatives extends readonly [RuntypeBase<unknown>, ...RuntypeBase<unknown>[]]
>(...alternatives: TAlternatives): Union<TAlternatives> {
  assertRuntype(...alternatives);
  type TResult = StaticUnion<TAlternatives>;
  type InnerValidate = (x: any, innerValidate: InnerValidateHelper) => Result<TResult>;
  const flatAlternatives: RuntypeBase<TResult>[] = [];
  for (const a of alternatives) {
    if (isUnionType(a)) {
      flatAlternatives.push(...(a.alternatives as any));
    } else {
      flatAlternatives.push(a as any);
    }
  }
  function validateWithKey(
    tag: string,
    types: Map<LiteralValue, RuntypeBase<TResult>>,
  ): InnerValidate {
    const typesString = `${Array.from(types.values())
      .map(v => show(v, true))
      .join(' | ')}`;
    return (value, innerValidate) => {
      if (!value || typeof value !== 'object') {
        return expected(typesString, value);
      }
      const validator = types.get(value[tag]);
      if (validator) {
        const result = innerValidate(validator, value);
        if (!result.success) {
          return failure(result.message, {
            key: `<${/^\d+$/.test(tag) ? `[${tag}]` : tag}: ${showValue(value[tag])}>${
              result.key ? `.${result.key}` : ``
            }`,
            fullError: unableToAssign(value, typesString, result),
          });
        }
        return result;
      } else {
        const err = expected(
          Array.from(types.keys())
            .map(v => (typeof v === 'string' ? `'${v}'` : v))
            .join(' | '),
          value[tag],
          {
            key: /^\d+$/.test(tag) ? `[${tag}]` : tag,
          },
        );
        err.fullError = unableToAssign(
          value,
          typesString,
          typesAreNotCompatible(/^\d+$/.test(tag) ? `[${tag}]` : `"${tag}"`, err.message),
        );
        return err;
      }
    };
  }

  function validateWithoutKey(alternatives: readonly RuntypeBase<TResult>[]): InnerValidate {
    return (value, innerValidate) => {
      let fullError: FullError | undefined;
      for (const targetType of alternatives) {
        const result = innerValidate(targetType, value);
        if (result.success) {
          return result as Result<TResult>;
        }
        if (!fullError) {
          fullError = unableToAssign(
            value,
            runtype,
            result.fullError || unableToAssign(value, targetType, result),
          );
        } else {
          fullError.push(andError(result.fullError || unableToAssign(value, targetType, result)));
        }
      }

      return expected(runtype, value, {
        fullError,
      });
    };
  }

  // This must be lazy to avoid eagerly evaluating any circular references
  const validatorOf = (mode: 'p' | 's' | 't'): InnerValidate => {
    const withFields = flatAlternatives
      .filter(a => resolveUnderlyingType(a, mode).tag !== 'never')
      .map(a => [a, findFields(a, mode)] as const);
    const withAtLeastOneField = withFields.filter(a => a[1].length !== 0);
    const withNoFields = withFields.filter(a => a[1].length === 0);
    const discriminant = findDiscriminator(withAtLeastOneField);

    if (discriminant && withNoFields.length) {
      const withKey = discriminant && validateWithKey(discriminant[0], discriminant[1]);
      const withoutKey = validateWithoutKey(withNoFields.map(v => v[0]));
      return (value, innerValidate) => {
        const resultWithKey = withKey(value, innerValidate);
        if (resultWithKey.success) {
          return resultWithKey;
        }
        const resultWithoutKey = withoutKey(value, innerValidate);
        if (!resultWithoutKey.success) {
          if (resultWithKey.fullError) {
            resultWithoutKey.fullError!.push(andError(resultWithKey.fullError!));
          } else {
            resultWithoutKey.fullError!.push(andError(unableToAssign(value, `Object`)));
          }
        }
        return resultWithoutKey;
      };
    } else if (discriminant) {
      return validateWithKey(discriminant[0], discriminant[1]);
    } else {
      return validateWithoutKey(flatAlternatives);
    }
  };
  const innerValidator = lazyValue(() => ({
    p: validatorOf('p'),
    s: validatorOf('s'),
    t: validatorOf('t'),
  }));

  const runtype: Union<TAlternatives> = create<Union<TAlternatives>>(
    'union',
    {
      p: (value, visited) => {
        return innerValidator().p(value, visited);
      },
      s: (value, visited) => {
        return innerValidator().s(value, visited);
      },
      t: (value, visited) => {
        const result = innerValidator().s(value, (t, v) => visited(t, v) || success(v as any));
        return result.success ? undefined : result;
      },
    },
    {
      alternatives: flatAlternatives as any,
      match: match as any,
      show(needsParens) {
        return parenthesize(`${flatAlternatives.map(v => show(v, true)).join(' | ')}`, needsParens);
      },
    },
  );

  return runtype;

  function match(...cases: any[]) {
    return (x: any) => {
      const visited: OpaqueVisitedState = createVisitedState();
      for (let i = 0; i < alternatives.length; i++) {
        const input = innerValidate(alternatives[i], x, visited);
        if (input.success) {
          return cases[i](input.value);
        }
      }
      // if none of the types matched, we should fail with an assertion error
      runtype.assert(x);
    };
  }
}

export interface Match<A extends readonly RuntypeBase<unknown>[]> {
  <Z>(
    ...a: { [key in keyof A]: A[key] extends RuntypeBase<unknown> ? Case<A[key], Z> : never }
  ): Matcher<A, Z>;
}

export type Case<T extends RuntypeBase<unknown>, Result> = (v: Static<T>) => Result;

export type Matcher<A extends readonly RuntypeBase<unknown>[], Z> = (
  x: {
    [key in keyof A]: A[key] extends RuntypeBase<infer Type> ? Type : unknown;
  }[number],
) => Z;
