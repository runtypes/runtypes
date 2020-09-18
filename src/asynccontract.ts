import { ValidationError } from './errors';
import {
  createGuardVisitedState,
  createVisitedState,
  innerGuard,
  innerValidate,
  OpaqueVisitedState,
  RuntypeBase,
} from './runtype';

export interface AsyncContract<A extends any[], Z> {
  enforce(f: (...a: A) => Promise<Z>): (...a: A) => Promise<Z>;
}

/**
 * Create a function contract.
 */
export function AsyncContract<A extends [any, ...any[]] | [], Z>(
  argTypes: { [key in keyof A]: key extends 'length' ? A['length'] : RuntypeBase<A[key]> },
  returnType: RuntypeBase<Z>,
): AsyncContract<A, Z> {
  return {
    enforce: (f: (...args: any[]) => any) => (...args: any[]) => {
      if (args.length < argTypes.length) {
        return Promise.reject(
          new ValidationError({
            message: `Expected ${argTypes.length} arguments but only received ${args.length}`,
          }),
        );
      }
      const visited: OpaqueVisitedState = createVisitedState();
      for (let i = 0; i < argTypes.length; i++) {
        const result = innerValidate(argTypes[i], args[i], visited);
        if (result.success) {
          args[i] = result.value;
        } else {
          return Promise.reject(new ValidationError(result));
        }
      }
      const returnedPromise = f(...args);
      if (!(returnedPromise instanceof Promise)) {
        return Promise.reject(
          new ValidationError({
            message: `Expected function to return a promise, but instead got ${returnedPromise}`,
          }),
        );
      }
      return returnedPromise.then(value => {
        const result = innerGuard(returnType, value, createGuardVisitedState());
        if (result) {
          throw new ValidationError(result);
        }
        return value;
      });
    },
  };
}
