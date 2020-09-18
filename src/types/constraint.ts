import { failure, success, unableToAssign } from '../result';
import { RuntypeBase, Static, create, Codec, assertRuntype } from '../runtype';
import show from '../show';
import showValue from '../showValue';
import { Unknown } from './unknown';

export type ConstraintCheck<A extends RuntypeBase<unknown>> = (x: Static<A>) => boolean | string;

export function isConstraintRuntype(
  runtype: RuntypeBase,
): runtype is Constraint<RuntypeBase, unknown, unknown> {
  return (
    'tag' in runtype && (runtype as Constraint<RuntypeBase, unknown, unknown>).tag === 'constraint'
  );
}

export interface Constraint<
  TUnderlying extends RuntypeBase<unknown>,
  TConstrained extends Static<TUnderlying> = Static<TUnderlying>,
  TArgs = unknown
> extends Codec<TConstrained> {
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
  assertRuntype(underlying);
  const runtype: Constraint<TUnderlying, TConstrained, TArgs> = create<
    Constraint<TUnderlying, TConstrained, TArgs>
  >(
    'constraint',
    (value, innerValidate) => {
      const name = options && options.name;
      const validated = innerValidate(underlying, value);

      if (!validated.success) {
        return validated;
      }

      const result = constraint(validated.value as any);
      if (!result || typeof result === 'string') {
        const message =
          typeof result === 'string'
            ? result
            : `${showValue(value)} failed ${name || 'constraint'} check`;
        return failure(message, {
          fullError: unableToAssign(value, runtype, message),
        });
      }
      return success(validated.value as TConstrained);
    },
    {
      underlying,
      constraint,
      name: options && options.name,
      args: options && options.args,

      show(needsParens) {
        return (options && options.name) || `WithConstraint<${show(underlying, needsParens)}>`;
      },
    },
  );
  return runtype;
}

export interface Guard<TConstrained, TArgs = unknown>
  extends Constraint<Unknown, TConstrained, TArgs> {}
export const Guard = <T, K = unknown>(
  test: (x: unknown) => x is T,
  options?: { name?: string; args?: K },
): Guard<T, K> => Unknown.withGuard(test, options);
