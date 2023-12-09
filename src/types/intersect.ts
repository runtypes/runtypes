import { Reflect } from '../reflect';
import { Runtype, RuntypeBase, Static, create, innerValidate } from '../runtype';
import { SUCCESS } from '../util';

export interface Intersect<A extends readonly [RuntypeBase, ...RuntypeBase[]]>
  extends Runtype<
    // We use the fact that a union of functions is effectively an intersection of parameters
    // e.g. to safely call (({x: 1}) => void | ({y: 2}) => void) you must pass {x: 1, y: 2}
    {
      [K in keyof A]: A[K] extends RuntypeBase ? (parameter: Static<A[K]>) => any : unknown;
    }[number] extends (k: infer I) => void
      ? I
      : never
  > {
  tag: 'intersect';
  intersectees: A;
}

/**
 * Construct an intersection runtype from runtypes for its alternatives.
 */
export function Intersect<A extends readonly [RuntypeBase, ...RuntypeBase[]]>(
  ...intersectees: A
): Intersect<A> {
  const self = ({ tag: 'intersect', intersectees } as unknown) as Reflect;
  return create((value, visited) => {
    let transformed = value;
    for (const targetType of intersectees) {
      const result = innerValidate(targetType, transformed, visited);
      if (!result.success) return result;
      transformed = result.value;
    }
    return SUCCESS(transformed);
  }, self);
}
