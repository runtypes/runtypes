import { RuntypeBase } from './runtype';
import { ValidationError } from './errors';

export interface Contract<A extends any[], Z> {
  enforce(f: (...a: A) => Z): (...a: A) => Z;
}

/**
 * Create a function contract.
 */
export function Contract<A extends [any, ...any[]] | [], Z>(
  argTypes: { [key in keyof A]: key extends 'length' ? A['length'] : RuntypeBase<A[key]> },
  returnType: RuntypeBase<Z>,
): Contract<A, Z> {
  return {
    enforce: (f: (...args: A) => Z) => (...args: A): Z => {
      if (args.length < argTypes.length)
        throw new ValidationError(
          `Expected ${argTypes.length} arguments but only received ${args.length}`,
        );
      for (let i = 0; i < argTypes.length; i++) {
        const result = argTypes[i].validate(args[i]);
        if (result.success) {
          argTypes[i] = result.value;
        } else {
          throw new ValidationError(result.message, result.key);
        }
      }
      const result = returnType.validate(f(...args));
      if (result.success) {
        return result.value;
      } else {
        throw new ValidationError(result.message, result.key);
      }
    },
  };
}
