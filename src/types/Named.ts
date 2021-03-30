import { RuntypeBase, Static, create, Codec, assertRuntype } from '../runtype';

export type ConstraintCheck<A extends RuntypeBase<unknown>> = (x: Static<A>) => boolean | string;

export function isNamedRuntype(runtype: RuntypeBase): runtype is Named<RuntypeBase> {
  return 'tag' in runtype && (runtype as Named<RuntypeBase>).tag === 'named';
}

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
    (value, innerValidate) => {
      return innerValidate(underlying as any, value);
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
