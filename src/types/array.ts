import {
  expected,
  failure,
  Failure,
  FullError,
  typesAreNotCompatible,
  unableToAssign,
} from '../result';
import {
  Static,
  create,
  RuntypeBase,
  Codec,
  createValidationPlaceholder,
  assertRuntype,
} from '../runtype';
import show from '../show';

export interface ReadonlyArray<E extends RuntypeBase<unknown> = RuntypeBase<unknown>>
  extends Codec<readonly Static<E>[]> {
  readonly tag: 'array';
  readonly element: E;
  readonly isReadonly: true;
}

export { Arr as Array };
interface Arr<E extends RuntypeBase<unknown> = RuntypeBase<unknown>> extends Codec<Static<E>[]> {
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
  assertRuntype(element);
  const result = create<ReadonlyArray<TElement> | Arr<TElement>>(
    'array',
    (xs, innerValidate) => {
      if (!Array.isArray(xs)) {
        return expected('an Array', xs);
      }

      return createValidationPlaceholder([...xs], placeholder => {
        let fullError: FullError | undefined = undefined;
        let firstError: Failure | undefined;
        for (let i = 0; i < xs.length; i++) {
          const validated = innerValidate(element, xs[i]);
          if (!validated.success) {
            if (!fullError) {
              fullError = unableToAssign(xs, result);
            }
            fullError.push(typesAreNotCompatible(`[${i}]`, validated));
            firstError =
              firstError ||
              failure(validated.message, {
                key: validated.key ? `[${i}].${validated.key}` : `[${i}]`,
                fullError: fullError,
              });
          } else {
            placeholder[i] = validated.value;
          }
        }
        return firstError;
      });
    },
    {
      isReadonly,
      element,
      show() {
        return `${isReadonly ? 'readonly ' : ''}${show(element, true)}[]`;
      },
    },
  );
  if (!isReadonly) {
    (result as any).asReadonly = () => InternalArr(element, true);
  }
  return result as any;
}

function Arr<TElement extends RuntypeBase<unknown>>(element: TElement): Arr<TElement> {
  return InternalArr(element, false);
}
export function ReadonlyArray<TElement extends RuntypeBase<unknown>>(
  element: TElement,
): ReadonlyArray<TElement> {
  return InternalArr(element, true);
}
