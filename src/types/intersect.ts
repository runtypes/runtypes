import { Runtype, Static, create, innerValidate } from '../runtype';

export interface Intersect<A extends readonly [Runtype, ...Runtype[]]>
  extends Runtype<
    // We use the fact that a union of functions is effectively an intersection of parameters
    // e.g. to safely call (({x: 1}) => void | ({y: 2}) => void) you must pass {x: 1, y: 2}
    {
      [key in keyof A]: A[key] extends Runtype ? (parameter: Static<A[key]>) => any : unknown;
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
export function Intersect<A extends readonly [Runtype, ...Runtype[]]>(
  ...intersectees: A
): Intersect<A> {
  return create(
    (value, visited) => {
      for (const targetType of intersectees) {
        let validated = innerValidate(targetType, value, visited);
        if (!validated.success) {
          return validated;
        }
      }
      return { success: true, value };
    },
    { tag: 'intersect', intersectees },
  );
}
