import { RuntypeBase, Static, create, Codec, assertRuntype } from '../runtype';

export type ConstraintCheck<A extends RuntypeBase<unknown>> = (x: Static<A>) => boolean | string;

export interface Named<TUnderlying extends RuntypeBase<unknown>>
  extends Codec<Static<TUnderlying>> {
  readonly tag: 'named';
  readonly underlying: TUnderlying;
  readonly name: string;
}

export function Named<TUnderlying extends RuntypeBase<unknown>>(
  name: string,
  underlying: TUnderlying,
): Named<TUnderlying> {
  assertRuntype(underlying);
  const runtype: Named<TUnderlying> = create<Named<TUnderlying>>(
    'named',
    {
      p: (value, _innerValidate, innerValidateToPlaceholder) => {
        return innerValidateToPlaceholder(underlying as any, value);
      },
      u: () => underlying,
    },
    {
      underlying,
      name,
      show() {
        return name;
      },
    },
  );
  return runtype;
}
