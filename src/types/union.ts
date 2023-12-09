import { Reflect } from '../reflect';
import { Runtype, RuntypeBase, Static, create, innerValidate } from '../runtype';
import { FAILURE, SUCCESS, hasKey } from '../util';
import { LiteralBase } from './literal';

export interface Union<A extends readonly [RuntypeBase, ...RuntypeBase[]]>
  extends Runtype<
    {
      [K in keyof A]: A[K] extends RuntypeBase ? Static<A[K]> : unknown;
    }[number]
  > {
  tag: 'union';
  alternatives: A;
  match: Match<A>;
}

/**
 * Construct a union runtype from runtypes for its alternatives.
 */
export function Union<T extends readonly [RuntypeBase, ...RuntypeBase[]]>(
  ...alternatives: T
): Union<T> {
  const match = (...cases: any[]) => (x: any) => {
    for (let i = 0; i < alternatives.length; i++) {
      if (alternatives[i].guard(x)) {
        return cases[i](x);
      }
    }
  };
  const self = ({ tag: 'union', alternatives, match } as unknown) as Reflect;
  return create<any>((value, visited) => {
    if (typeof value !== 'object' || value === null) {
      for (const alternative of alternatives) {
        const result = innerValidate(alternative, value, visited);
        if (result.success) return SUCCESS(result.value);
      }
      return FAILURE.TYPE_INCORRECT(self, value);
    }

    const commonLiteralFields: { [K: string]: LiteralBase[] } = {};
    for (const alternative of alternatives) {
      if (alternative.reflect.tag === 'record') {
        for (const fieldName in alternative.reflect.fields) {
          const field = alternative.reflect.fields[fieldName];
          if (field.tag === 'literal') {
            if (commonLiteralFields[fieldName]) {
              if (commonLiteralFields[fieldName].every(value => value !== field.value)) {
                commonLiteralFields[fieldName].push(field.value);
              }
            } else {
              commonLiteralFields[fieldName] = [field.value];
            }
          }
        }
      }
    }

    for (const fieldName in commonLiteralFields) {
      if (commonLiteralFields[fieldName].length === alternatives.length) {
        for (const alternative of alternatives) {
          if (alternative.reflect.tag === 'record') {
            const field = alternative.reflect.fields[fieldName];
            if (
              field.tag === 'literal' &&
              hasKey(fieldName, value) &&
              value[fieldName] === field.value
            ) {
              return innerValidate(alternative, value, visited);
            }
          }
        }
      }
    }

    for (const targetType of alternatives) {
      const result = innerValidate(targetType, value, visited);
      if (result.success) return SUCCESS(result.value);
    }

    return FAILURE.TYPE_INCORRECT(self, value);
  }, self);
}

export interface Match<A extends readonly [RuntypeBase, ...RuntypeBase[]]> {
  <Z>(...a: { [K in keyof A]: A[K] extends RuntypeBase ? Case<A[K], Z> : never }): Matcher<A, Z>;
}

export type Case<T extends RuntypeBase, Result> = (v: Static<T>) => Result;

export type Matcher<A extends readonly [RuntypeBase, ...RuntypeBase[]], Z> = (
  x: {
    [K in keyof A]: A[K] extends RuntypeBase<infer Type> ? Type : unknown;
  }[number],
) => Z;
