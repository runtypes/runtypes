import { Runtype, Static, create, innerValidate, RuntypeBase, VisitedState } from '../runtype';
import show from '../show';
import { LiteralValue, isLiteralRuntype } from './literal';
import { lazyValue, resolveLazyRuntype } from './lazy';
import { isRecordRuntype } from './record';
import { Result } from '../result';
import { isTupleRuntype } from './tuple';

export type StaticUnion<TAlternatives extends readonly RuntypeBase<unknown>[]> = {
  [key in keyof TAlternatives]: TAlternatives[key] extends RuntypeBase<unknown>
    ? Static<TAlternatives[key]>
    : unknown;
}[number];

export interface Union<TAlternatives extends readonly RuntypeBase<unknown>[]>
  extends Runtype<StaticUnion<TAlternatives>> {
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
/**
 * Construct a union runtype from runtypes for its alternatives.
 */
export function Union<
  TAlternatives extends readonly [RuntypeBase<unknown>, ...RuntypeBase<unknown>[]]
>(...alternatives: TAlternatives): Union<TAlternatives> {
  type TResult = StaticUnion<TAlternatives>;
  type InnerValidate = (x: any, visited: VisitedState) => Result<TResult>;
  function validateWithKey(
    tag: string | 0,
    types: Map<LiteralValue, RuntypeBase<TResult>>,
  ): InnerValidate {
    return (value, visited) => {
      if (!value || typeof value !== 'object') {
        return {
          success: false,
          message: `Expected ${show(runtype)}, but was ${value === null ? value : typeof value}`,
        };
      }
      const validator = types.get(value[tag]);
      if (validator) {
        const result = innerValidate(validator, value, visited);
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
      const alts = alternatives.map(resolveLazyRuntype);
      const recordAlternatives = alts.filter(isRecordRuntype);
      if (recordAlternatives.length === alternatives.length) {
        const commonLiteralFields: {
          [key: string]: Map<LiteralValue, RuntypeBase<TResult>>;
        } = {};
        for (const alternative of recordAlternatives) {
          for (const fieldName in alternative.fields) {
            const field = resolveLazyRuntype(alternative.fields[fieldName]);
            if (isLiteralRuntype(field)) {
              if (!commonLiteralFields[fieldName]) {
                commonLiteralFields[fieldName] = new Map();
              }
              if (!commonLiteralFields[fieldName].has(field.value)) {
                commonLiteralFields[fieldName].set(
                  field.value,
                  alternative as RuntypeBase<StaticUnion<TAlternatives>>,
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
        for (const alternative of tupleAlternatives) {
          const field = resolveLazyRuntype(alternative.components[0]);
          if (isLiteralRuntype(field)) {
            if (!commonLiteralFields.has(field.value)) {
              commonLiteralFields.set(
                field.value,
                alternative as RuntypeBase<StaticUnion<TAlternatives>>,
              );
            }
          }
        }
        if (commonLiteralFields.size === alternatives.length) {
          return validateWithKey(0, commonLiteralFields);
        }
      }
      return (value, visited) => {
        for (const targetType of alternatives) {
          if (innerValidate(targetType, value, visited).success) {
            return { success: true, value };
          }
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
      for (let i = 0; i < alternatives.length; i++) {
        const input = alternatives[i].validate(x);
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
