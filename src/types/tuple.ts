import { create, innerValidate, RuntypeBase, Runtype } from '../runtype';
import { Array as Arr } from './array';
import { Unknown } from './unknown';

export type StaticTuple<TElements extends readonly RuntypeBase<unknown>[]> = {
  [key in keyof TElements]: TElements[key] extends RuntypeBase<infer E> ? E : unknown;
};

export interface Tuple<
  TElements extends readonly RuntypeBase<unknown>[] = readonly RuntypeBase<unknown>[]
> extends Runtype<StaticTuple<TElements>> {
  readonly tag: 'tuple';
  readonly components: TElements;
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
  return create<Tuple<T>>(
    (x, visited) => {
      const validated = innerValidate(Arr(Unknown), x, visited);

      if (!validated.success) {
        return {
          success: false,
          message: `Expected tuple to be an array: ${validated.message}`,
          key: validated.key,
        };
      }

      if (validated.value.length !== components.length) {
        return {
          success: false,
          message: `Expected an array of length ${components.length}, but was ${validated.value.length}`,
        };
      }

      for (let i = 0; i < components.length; i++) {
        let validatedComponent = innerValidate(components[i], validated.value[i], visited);

        if (!validatedComponent.success) {
          return {
            success: false,
            message: validatedComponent.message,
            key: validatedComponent.key ? `[${i}].${validatedComponent.key}` : `[${i}]`,
          };
        }
      }

      return { success: true, value: x };
    },
    {
      tag: 'tuple',
      components,
      show({ showChild }) {
        return `[${(components as readonly RuntypeBase<unknown>[])
          .map(e => showChild(e, false))
          .join(', ')}]`;
      },
    },
  );
}
