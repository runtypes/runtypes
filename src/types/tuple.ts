import { Failcode, Message, Result } from '../result';
import { Runtype, Static, create, innerValidate } from '../runtype';
import { enumerableKeysOf, FAILURE, SUCCESS } from '../util';
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
    (xs, visited) => {
      const validated = innerValidate(Arr(Unknown), xs, visited);

      if (!validated.success)
        return FAILURE(
          Failcode.TYPE_INCORRECT,
          `Expected tuple to be an array: ${validated.message}`,
        );

      if (validated.value.length !== components.length)
        return FAILURE(
          Failcode.VALUE_INCORRECT,
          `Expected tuple of length ${components.length}, but was ${validated.value.length}`,
        );

      const keys = enumerableKeysOf(xs);
      const results: Result<unknown>[] = keys.map(key =>
        innerValidate(components[key as any], xs[key as any], visited),
      );
      const message = keys.reduce<{ [key: number]: Message } & Message[]>((message, key) => {
        const result = results[key as any];
        if (!result.success) message[key as any] = result.message;
        return message;
      }, []);

      if (enumerableKeysOf(message).length !== 0)
        return FAILURE(Failcode.CONTENT_INCORRECT, message);
      else return SUCCESS(xs);
    },
    { tag: 'tuple', components },
  );
}
