import { Runtype } from './index';
import { ValidationError } from './errors';
import { Static } from './runtype';

export interface Contract<A extends readonly Runtype[], R extends Runtype> {
  enforce(
    f: (
      ...args: {
        [key in keyof A]: A[key] extends Runtype ? Static<A[key]> : unknown;
      }
    ) => Static<R>,
  ): (
    ...args: {
      [key in keyof A]: A[key] extends Runtype ? Static<A[key]> : unknown;
    }
  ) => Static<R>;
}

/**
 * Create a function contract.
 */
export function Contract<A extends readonly Runtype[], R extends Runtype>(
  ...runtypes: [...A, R]
): Contract<A, R>;

export function Contract<A extends readonly Runtype[], R extends Runtype>(
  ...runtypes: [...A, R]
): Contract<A, R> {
  const lastIndex = runtypes.length - 1;
  const argTypes = runtypes.slice(0, lastIndex);
  const returnRuntype = runtypes[lastIndex] as R;
  return {
    enforce: (
      f: (
        ...args: {
          [key in keyof A]: A[key] extends Runtype ? Static<A[key]> : unknown;
        }
      ) => Static<R>,
    ) => (
      ...args: {
        [key in keyof A]: A[key] extends Runtype ? Static<A[key]> : unknown;
      }
    ): Static<R> => {
      if (args.length < argTypes.length)
        throw new ValidationError(
          `Expected ${argTypes.length} arguments but only received ${args.length}`,
        );
      for (let i = 0; i < argTypes.length; i++) argTypes[i].check(args[i]);
      return returnRuntype.check(f(...args));
    },
  };
}
