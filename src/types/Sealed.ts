import { RuntypeBase, Static, create, Codec, assertRuntype } from '../runtype';
import show from '../show';

export interface Sealed<TUnderlying extends RuntypeBase<unknown>>
  extends Codec<Static<TUnderlying>> {
  readonly tag: 'sealed';
  readonly underlying: TUnderlying;
  readonly deep: boolean;
}

export interface SealedConfig {
  readonly deep?: boolean;
}
export function Sealed<TUnderlying extends RuntypeBase<unknown>>(
  underlying: TUnderlying,
  { deep = false }: SealedConfig = {},
): Sealed<TUnderlying> {
  assertRuntype(underlying);

  return create<Sealed<TUnderlying>>(
    'sealed',
    {
      p: (value, _innerValidate, innerParseToPlaceholder) => {
        return innerParseToPlaceholder<Static<TUnderlying>>(
          underlying as RuntypeBase<Static<TUnderlying>>,
          value,
          { deep },
        );
      },
      u: () => underlying,
    },
    {
      underlying,
      deep,
      show: () => `Sealed<${show(underlying, false)}>`,
    },
  );
}
