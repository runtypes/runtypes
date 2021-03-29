import { Message, Result } from '../result';
import { Runtype, Static, create, innerValidate } from '../runtype';
import { enumerableKeysOf, typeOf } from '../util';

type ArrayStaticType<E extends Runtype, RO extends boolean> = RO extends true
  ? ReadonlyArray<Static<E>>
  : Static<E>[];

interface Arr<E extends Runtype, RO extends boolean> extends Runtype<ArrayStaticType<E, RO>> {
  tag: 'array';
  element: E;
  isReadonly: RO;

  asReadonly(): Arr<E, true>;
}

/**
 * Construct an array runtype from a runtype for its elements.
 */
function InternalArr<E extends Runtype, RO extends boolean>(
  element: E,
  isReadonly: RO,
): Arr<E, RO> {
  return withExtraModifierFuncs(
    create(
      (xs, visited) => {
        if (!Array.isArray(xs)) {
          return {
            success: false,
            message: `Expected array, but was ${typeOf(xs)}`,
          };
        }

        const keys = enumerableKeysOf(xs);
        const results: Result<unknown>[] = keys.map(key =>
          innerValidate(element, xs[key as any], visited),
        );
        const message = keys.reduce<{ [key: number]: Message } & Message[]>((message, key) => {
          const result = results[key as any];
          if (!result.success) message[key as any] = result.message;
          return message;
        }, []);

        if (enumerableKeysOf(message).length !== 0) return { success: false, message };
        else return { success: true, value: xs };
      },
      { tag: 'array', isReadonly, element },
    ),
  );
}

function Arr<E extends Runtype, RO extends boolean>(element: E): Arr<E, false> {
  return InternalArr(element, false);
}

function withExtraModifierFuncs<E extends Runtype, RO extends boolean>(A: any): Arr<E, RO> {
  A.asReadonly = asReadonly;

  return A;

  function asReadonly(): Arr<E, true> {
    return InternalArr(A.element, true);
  }
}

export { Arr as Array };
