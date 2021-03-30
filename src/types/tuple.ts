import {
  expected,
  failure,
  Failure,
  FullError,
  typesAreNotCompatible,
  unableToAssign,
} from '../result';
import { create, RuntypeBase, Codec, createValidationPlaceholder, assertRuntype } from '../runtype';
import show from '../show';

export type StaticTuple<TElements extends readonly RuntypeBase<unknown>[]> = {
  [key in keyof TElements]: TElements[key] extends RuntypeBase<infer E> ? E : unknown;
};
export type ReadonlyStaticTuple<TElements extends readonly RuntypeBase<unknown>[]> = {
  readonly [key in keyof TElements]: TElements[key] extends RuntypeBase<infer E> ? E : unknown;
};

export interface Tuple<
  TElements extends readonly RuntypeBase<unknown>[] = readonly RuntypeBase<unknown>[]
> extends Codec<StaticTuple<TElements>> {
  readonly tag: 'tuple';
  readonly components: TElements;
  readonly isReadonly: false;
}

export interface ReadonlyTuple<
  TElements extends readonly RuntypeBase<unknown>[] = readonly RuntypeBase<unknown>[]
> extends Codec<ReadonlyStaticTuple<TElements>> {
  readonly tag: 'tuple';
  readonly components: TElements;
  readonly isReadonly: true;
}

export function isTupleRuntype(runtype: RuntypeBase): runtype is Tuple<readonly RuntypeBase[]> {
  return 'tag' in runtype && (runtype as Tuple<readonly RuntypeBase[]>).tag === 'tuple';
}

/**
 * Construct a tuple runtype from runtypes for each of its elements.
 */
export function Tuple<
  T extends readonly [RuntypeBase<unknown>, ...RuntypeBase<unknown>[]] | readonly []
>(...components: T): Tuple<T> {
  assertRuntype(...components);
  const result = create<Tuple<T>>(
    'tuple',
    (x, innerValidate) => {
      if (!Array.isArray(x)) {
        return expected(`tuple to be an array`, x);
      }

      if (x.length !== components.length) {
        return expected(`an array of length ${components.length}`, x.length);
      }

      return createValidationPlaceholder([...x] as any, placeholder => {
        let fullError: FullError | undefined = undefined;
        let firstError: Failure | undefined;
        for (let i = 0; i < components.length; i++) {
          let validatedComponent = innerValidate(components[i], x[i]);

          if (!validatedComponent.success) {
            if (!fullError) {
              fullError = unableToAssign(x, result);
            }
            fullError.push(typesAreNotCompatible(`[${i}]`, validatedComponent));
            firstError =
              firstError ||
              failure(validatedComponent.message, {
                key: validatedComponent.key ? `[${i}].${validatedComponent.key}` : `[${i}]`,
                fullError: fullError,
              });
          } else {
            placeholder[i] = validatedComponent.value;
          }
        }
        return firstError;
      });
    },
    {
      components,
      isReadonly: false,
      show() {
        return `[${(components as readonly RuntypeBase<unknown>[])
          .map(e => show(e, false))
          .join(', ')}]`;
      },
    },
  );
  return result;
}
