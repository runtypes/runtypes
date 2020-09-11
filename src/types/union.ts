import {
  Codec,
  Static,
  create,
  RuntypeBase,
  InnerValidateHelper,
  innerValidate,
  createVisitedState,
  OpaqueVisitedState,
} from '../runtype';
import show from '../show';
import { LiteralValue, isLiteralRuntype } from './literal';
import { lazyValue, isLazyRuntype } from './lazy';
import { isRecordRuntype } from './record';
import { Result } from '../result';
import { isTupleRuntype } from './tuple';
import { isBrandRuntype } from './brand';
import { isConstraintRuntype } from './constraint';
import { isParsedValueRuntype } from './ParsedValue';

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

function valueToString(value: any) {
  return value === null || typeof value === 'number' || typeof value === 'boolean'
    ? value
    : typeof value === 'string'
    ? `'${value}'`
    : typeof value;
}

function resolveUnderlyingType(runtype: RuntypeBase): RuntypeBase {
  if (isLazyRuntype(runtype)) return resolveUnderlyingType(runtype.underlying());
  if (isBrandRuntype(runtype)) return resolveUnderlyingType(runtype.entity);
  if (isConstraintRuntype(runtype)) return resolveUnderlyingType(runtype.underlying);
  if (isParsedValueRuntype(runtype)) return resolveUnderlyingType(runtype.underlying);

  return runtype;
}

/**
 * Construct a union runtype from runtypes for its alternatives.
 */
export function Union<
  TAlternatives extends readonly [RuntypeBase<unknown>, ...RuntypeBase<unknown>[]]
>(...alternatives: TAlternatives): Union<TAlternatives> {
  type TResult = StaticUnion<TAlternatives>;
  type InnerValidate = (x: any, innerValidate: InnerValidateHelper) => Result<TResult>;
  function validateWithKey(
    tag: string | 0,
    types: Map<LiteralValue, RuntypeBase<TResult>>,
  ): InnerValidate {
    return (value, innerValidate) => {
      if (!value || typeof value !== 'object') {
        return {
          success: false,
          message: `Expected ${show(runtype)}, but was ${value === null ? value : typeof value}`,
        };
      }
      const validator = types.get(value[tag]);
      if (validator) {
        const result = innerValidate(validator, value);
        if (!result.success) {
          return {
            success: false,
            message: result.message,
            key: `<${tag === 0 ? `[0]` : tag}: ${valueToString(value[tag])}>${
              result.key ? `.${result.key}` : ``
            }`,
          };
        }
        return result;
      } else {
        return {
          success: false,
          message: `Expected ${Array.from(types.keys())
            .map(v => (typeof v === 'string' ? `'${v}'` : v))
            .join(' | ')}, but was ${valueToString(value[tag])}`,
          key: tag === 0 ? `[0]` : tag,
        };
      }
    };
  }
  const innerValidator = lazyValue(
    // This must be lazy to avoid eagerly evaluating any circular references
    (): InnerValidate => {
      const alts = alternatives.map(resolveUnderlyingType);
      const recordAlternatives = alts.filter(isRecordRuntype);
      if (recordAlternatives.length === alternatives.length) {
        const commonLiteralFields: {
          [key: string]: Map<LiteralValue, RuntypeBase<TResult>>;
        } = {};
        for (let i = 0; i < alternatives.length; i++) {
          for (const fieldName in recordAlternatives[i].fields) {
            const field = resolveUnderlyingType(recordAlternatives[i].fields[fieldName]);
            if (isLiteralRuntype(field)) {
              if (!commonLiteralFields[fieldName]) {
                commonLiteralFields[fieldName] = new Map();
              }
              if (!commonLiteralFields[fieldName].has(field.value)) {
                commonLiteralFields[fieldName].set(
                  field.value,
                  // @ts-expect-error
                  alternatives[i],
                );
              }
            }
          }
        }
        for (const tag of ['type', 'kind', 'tag', ...Object.keys(commonLiteralFields)]) {
          if (tag in commonLiteralFields && commonLiteralFields[tag].size === alternatives.length) {
            return validateWithKey(tag, commonLiteralFields[tag]);
          }
        }
      }
      const tupleAlternatives = alts.filter(isTupleRuntype);
      if (tupleAlternatives.length === alternatives.length) {
        const commonLiteralFields = new Map<LiteralValue, RuntypeBase<TResult>>();
        for (let i = 0; i < alternatives.length; i++) {
          const field = resolveUnderlyingType(tupleAlternatives[i].components[0]);
          if (isLiteralRuntype(field)) {
            if (!commonLiteralFields.has(field.value)) {
              commonLiteralFields.set(
                field.value,
                // @ts-expect-error
                alternatives[i],
              );
            }
          }
        }
        if (commonLiteralFields.size === alternatives.length) {
          return validateWithKey(0, commonLiteralFields);
        }
      }
      return (value, innerValidate) => {
        let errorsWithKey = 0;
        let lastError;
        let lastErrorRuntype;
        for (const targetType of alternatives) {
          const result = innerValidate(targetType, value);
          if (result.success) {
            return result as Result<TResult>;
          }
          if (result.key) {
            errorsWithKey++;
            lastError = result;
            lastErrorRuntype = targetType;
          }
        }

        if (lastError && lastErrorRuntype && errorsWithKey === 1) {
          return {
            success: false,
            message: lastError.message,
            key: `<${show(lastErrorRuntype)}>.${lastError.key}`,
          };
        }
        return {
          success: false,
          message: `Expected ${show(runtype)}, but was ${value === null ? value : typeof value}`,
        };
      };
    },
  );

  const runtype: Union<TAlternatives> = create<Union<TAlternatives>>(
    (value, visited) => {
      return innerValidator()(value, visited);
    },
    {
      tag: 'union',
      alternatives,
      match: match as any,
      show({ parenthesize, showChild }) {
        return parenthesize(`${alternatives.map(v => showChild(v, true)).join(' | ')}`);
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
