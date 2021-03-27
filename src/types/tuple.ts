import { Runtype, Static, create, innerValidate } from '../runtype';
import { Array as Arr } from './array';
import { Unknown } from './unknown';

export interface Tuple<A extends readonly Runtype[]>
  extends Runtype<
    {
      [key in keyof A]: A[key] extends Runtype ? Static<A[key]> : unknown;
    }
  > {
  tag: 'tuple';
  components: A;
}

/**
 * Construct a tuple runtype from runtypes for each of its elements.
 */
export function Tuple<T extends readonly Runtype[]>(...components: T): Tuple<T> {
  return create(
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
    { tag: 'tuple', components },
  );
}
