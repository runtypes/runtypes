import { create, RuntypeBase, Codec, Static } from '../runtype';
import show from '../show';

export interface Lazy<TUnderlying extends RuntypeBase<unknown>> extends Codec<Static<TUnderlying>> {
  readonly tag: 'lazy';
  readonly underlying: () => TUnderlying;
}

export function lazyValue<T>(fn: () => T) {
  let value: T;
  return () => {
    return value || (value = fn());
  };
}

/**
 * Construct a possibly-recursive Runtype.
 */
export function Lazy<TUnderlying extends RuntypeBase<unknown>>(
  delayed: () => TUnderlying,
): Lazy<TUnderlying> {
  const underlying = lazyValue(delayed);

  return create<Lazy<TUnderlying>>(
    'lazy',
    {
      p: (value, _innerValidate, innerValidateToPlaceholder) =>
        innerValidateToPlaceholder(underlying(), value) as any,
      u: underlying,
    },
    {
      underlying,
      show(needsParens) {
        return show(underlying(), needsParens);
      },
    },
  );
}
