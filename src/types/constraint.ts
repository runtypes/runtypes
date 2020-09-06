import { RuntypeBase, Static, create, innerValidate, Runtype } from '../runtype';
import { String } from './string';
import { Unknown } from './unknown';

export type ConstraintCheck<A extends RuntypeBase<unknown>> = (x: Static<A>) => boolean | string;

export interface Constraint<
  TUnderlying extends RuntypeBase<unknown>,
  TConstrained extends Static<TUnderlying> = Static<TUnderlying>,
  TArgs = unknown
> extends Runtype<TConstrained> {
  readonly tag: 'constraint';
  readonly underlying: TUnderlying;
  // See: https://github.com/Microsoft/TypeScript/issues/19746 for why this isn't just
  // `constraint: ConstraintCheck<A>`
  constraint(x: Static<TUnderlying>): boolean | string;
  readonly name?: string;
  readonly args?: TArgs;
}

export function Constraint<
  TUnderlying extends RuntypeBase<unknown>,
  TConstrained extends Static<TUnderlying> = Static<TUnderlying>,
  TArgs = unknown
>(
  underlying: TUnderlying,
  constraint: ConstraintCheck<TUnderlying>,
  options?: { name?: string; args?: TArgs },
): Constraint<TUnderlying, TConstrained, TArgs> {
  return create<Constraint<TUnderlying, TConstrained, TArgs>>(
    (value, visited) => {
      const name = options && options.name;
      const validated = innerValidate(underlying, value, visited);

      if (!validated.success) {
        return validated;
      }

      const result = constraint(validated.value as any);
      if (String.guard(result)) return { success: false, message: result };
      else if (!result) return { success: false, message: `Failed ${name || 'constraint'} check` };
      return { success: true, value: validated.value as TConstrained };
    },
    {
      tag: 'constraint',
      underlying,
      constraint,
      name: options && options.name,
      args: options && options.args,

      show({ needsParens, showChild }) {
        return (options && options.name) || showChild(underlying, needsParens);
      },
    },
  );
}

export const Guard = <T, K = unknown>(
  guard: (x: unknown) => x is T,
  options?: { name?: string; args?: K },
) => Unknown.withGuard(guard, options);
