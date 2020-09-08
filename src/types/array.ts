import { Static, create, RuntypeBase, Runtype, createValidationPlaceholder } from '../runtype';

export interface ReadonlyArray<E extends RuntypeBase<unknown> = RuntypeBase<unknown>>
  extends Runtype<readonly Static<E>[]> {
  readonly tag: 'array';
  readonly element: E;
  readonly isReadonly: true;
}

export { Arr as Array };
interface Arr<E extends RuntypeBase<unknown> = RuntypeBase<unknown>> extends Runtype<Static<E>[]> {
  readonly tag: 'array';
  readonly element: E;
  readonly isReadonly: false;
  asReadonly(): ReadonlyArray<E>;
}

/**
 * Construct an array runtype from a runtype for its elements.
 */
function InternalArr<TElement extends RuntypeBase<unknown>, IsReadonly extends boolean>(
  element: TElement,
  isReadonly: IsReadonly,
): IsReadonly extends true ? ReadonlyArray<TElement> : Arr<TElement> {
  const result = create<ReadonlyArray<TElement> | Arr<TElement>>(
    (xs, innerValidate) => {
      if (!Array.isArray(xs)) {
        return {
          success: false,
          message: `Expected array, but was ${xs === null ? xs : typeof xs}`,
        };
      }

      return createValidationPlaceholder([...xs], placeholder => {
        for (let i = 0; i < xs.length; i++) {
          const validated = innerValidate(element, xs[i]);
          if (!validated.success) {
            return {
              success: false,
              message: validated.message,
              key: validated.key ? `[${i}].${validated.key}` : `[${i}]`,
            };
          } else {
            placeholder[i] = validated.value;
          }
        }
      });
    },
    {
      tag: 'array',
      isReadonly,
      element,
      show({ showChild }) {
        return `${isReadonly ? 'readonly ' : ''}${showChild(element, true)}[]`;
      },
    },
  );
  if (!isReadonly) {
    (result as any).asReadonly = asReadonly;
  }
  return result as any;
  function asReadonly(): ReadonlyArray<TElement> {
    return InternalArr(element, true);
  }
}

function Arr<TElement extends RuntypeBase<unknown>>(element: TElement): Arr<TElement> {
  return InternalArr(element, false);
}
export function ReadonlyArray<TElement extends RuntypeBase<unknown>>(
  element: TElement,
): ReadonlyArray<TElement> {
  return InternalArr(element, true);
}
