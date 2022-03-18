import { failure, success } from '../result';
import {
  Static,
  create,
  RuntypeBase,
  Codec,
  createValidationPlaceholder,
  assertRuntype,
  SealedState,
  getFields,
} from '../runtype';
import show, { parenthesize } from '../show';
import { lazyValue } from './lazy';

// We use the fact that a union of functions is effectively an intersection of parameters
// e.g. to safely call (({x: 1}) => void | ({y: 2}) => void) you must pass {x: 1, y: 2}
export type StaticIntersect<TIntersectees extends readonly RuntypeBase<unknown>[]> = {
  [key in keyof TIntersectees]: TIntersectees[key] extends RuntypeBase
    ? (parameter: Static<TIntersectees[key]>) => any
    : unknown;
}[number] extends (k: infer I) => void
  ? I
  : never;

export interface Intersect<
  TIntersectees extends readonly [RuntypeBase<unknown>, ...RuntypeBase<unknown>[]],
> extends Codec<StaticIntersect<TIntersectees>> {
  readonly tag: 'intersect';
  readonly intersectees: TIntersectees;
}

export function isIntersectRuntype(
  runtype: RuntypeBase,
): runtype is Intersect<[RuntypeBase, ...RuntypeBase[]]> {
  return (
    'tag' in runtype && (runtype as Intersect<[RuntypeBase, ...RuntypeBase[]]>).tag === 'intersect'
  );
}

/**
 * Construct an intersection runtype from runtypes for its alternatives.
 */
export function Intersect<
  TIntersectees extends readonly [RuntypeBase<unknown>, ...RuntypeBase<unknown>[]],
>(...intersectees: TIntersectees): Intersect<TIntersectees> {
  assertRuntype(...intersectees);
  const allFieldInfoForMode = (mode: 'p' | 't' | 's') => {
    const intresecteesWithOwnFields = intersectees.map(intersectee => ({
      i: intersectee,
      f: getFields(intersectee, mode),
    }));
    const intersecteesWithOtherFields = new Map(
      intersectees.map(intersectee => {
        const allFields = new Set<string>();
        for (const { i, f: fields } of intresecteesWithOwnFields) {
          if (i !== intersectee) {
            if (fields === undefined) return [intersectee, undefined] as const;
            for (const field of fields) {
              allFields.add(field);
            }
          }
        }
        return [intersectee, allFields] as const;
      }),
    );

    const allFields = new Set<string>();
    for (const { f: fields } of intresecteesWithOwnFields) {
      if (fields === undefined) return { intersecteesWithOtherFields, allFields: undefined };
      for (const field of fields) {
        allFields.add(field);
      }
    }
    return { intersecteesWithOtherFields, allFields };
  };
  // use lazy value here so that:
  // 1. If this is never used in a `Sealed` context, we can skip evaluating it
  // 2. Circular references using `Lazy` don't break.
  const allFieldInfo = {
    p: lazyValue(() => allFieldInfoForMode(`p`)),
    t: lazyValue(() => allFieldInfoForMode(`t`)),
    s: lazyValue(() => allFieldInfoForMode(`s`)),
  };
  return create<Intersect<TIntersectees>>(
    'intersect',
    {
      p: (value, innerValidate, _innerValidateToPlaceholder, mode, sealed) => {
        const getSealed = sealed
          ? (targetType: RuntypeBase): SealedState => {
              const i = allFieldInfo[mode]().intersecteesWithOtherFields.get(targetType);
              if (i === undefined) return false;
              else return { keysFromIntersect: i, deep: sealed.deep };
            }
          : (_i: RuntypeBase): SealedState => false;
        if (Array.isArray(value)) {
          return createValidationPlaceholder<any>([...value], placeholder => {
            for (const targetType of intersectees) {
              let validated = innerValidate(targetType, placeholder, getSealed(targetType));
              if (!validated.success) {
                return validated;
              }
              if (!Array.isArray(validated.value)) {
                return failure(
                  `The validator ${show(
                    targetType,
                  )} attempted to convert the type of this value from an array to something else. That conversion is not valid as the child of an intersect`,
                );
              }
              placeholder.splice(0, placeholder.length, ...validated.value);
            }
          });
        } else if (value && typeof value === 'object') {
          return createValidationPlaceholder<any>(Object.create(null), placeholder => {
            for (const targetType of intersectees) {
              let validated = innerValidate(targetType, value, getSealed(targetType));
              if (!validated.success) {
                return validated;
              }
              if (!(validated.value && typeof validated.value === 'object')) {
                return failure(
                  `The validator ${show(
                    targetType,
                  )} attempted to convert the type of this value from an object to something else. That conversion is not valid as the child of an intersect`,
                );
              }
              Object.assign(placeholder, validated.value);
            }
          });
        }
        let result = value;
        for (const targetType of intersectees) {
          let validated = innerValidate(targetType, result, getSealed(targetType));
          if (!validated.success) {
            return validated;
          }
          result = validated.value;
        }
        return success(result);
      },
      f: mode => allFieldInfo[mode]().allFields,
    },
    {
      intersectees,
      show(needsParens) {
        return parenthesize(`${intersectees.map(v => show(v, true)).join(' & ')}`, needsParens);
      },
    },
  );
}
