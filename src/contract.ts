import {
  createGuardVisitedState,
  createVisitedState,
  innerGuard,
  innerValidate,
  OpaqueVisitedState,
  RuntypeBase,
} from './runtype';
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
        throw new ValidationError({
          message: `Expected ${argTypes.length} arguments but only received ${args.length}`,
        });
      const visited: OpaqueVisitedState = createVisitedState();
      for (let i = 0; i < argTypes.length; i++) {
        const result = innerValidate(argTypes[i], args[i], visited);
        if (result.success) {
          args[i] = result.value;
        } else {
          throw new ValidationError(result);
        }
      }
      const rawResult = f(...args);
      const result = innerGuard(returnType, rawResult, createGuardVisitedState());
      if (result) {
        throw new ValidationError(result);
      }
      return rawResult;
    },
  };
}
