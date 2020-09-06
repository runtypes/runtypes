import { Static, create, innerValidate, RuntypeBase, Runtype } from '../runtype';

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
  TIntersectees extends readonly [RuntypeBase<unknown>, ...RuntypeBase<unknown>[]]
> extends Runtype<StaticIntersect<TIntersectees>> {
  readonly tag: 'intersect';
  readonly intersectees: TIntersectees;
}

/**
 * Construct an intersection runtype from runtypes for its alternatives.
 */
export function Intersect<
  TIntersectees extends readonly [RuntypeBase<unknown>, ...RuntypeBase<unknown>[]]
>(...intersectees: TIntersectees): Intersect<TIntersectees> {
  return create<Intersect<TIntersectees>>(
    (value, visited) => {
      for (const targetType of intersectees) {
        let validated = innerValidate(targetType, value, visited);
        if (!validated.success) {
          return validated;
        }
      }
      return { success: true, value };
    },
    {
      tag: 'intersect',
      intersectees,
      show({ parenthesize, showChild }) {
        return parenthesize(`${intersectees.map(v => showChild(v, true)).join(' & ')}`);
      },
    },
  );
}
