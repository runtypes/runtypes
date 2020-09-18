import { RuntypeBase, Static, create, Codec, assertRuntype } from '../runtype';
import show from '../show';

export const RuntypeName = Symbol('RuntypeName');

export interface Brand<B extends string, A extends RuntypeBase<unknown>>
  extends Codec<
    Static<A> & {
      [RuntypeName]: B;
    }
  > {
  readonly tag: 'brand';
  readonly brand: B;
  readonly entity: A;
}

export function isBrandRuntype(runtype: RuntypeBase): runtype is Brand<string, RuntypeBase> {
  return 'tag' in runtype && (runtype as Brand<string, RuntypeBase>).tag === 'brand';
}

export function Brand<B extends string, A extends RuntypeBase<unknown>>(brand: B, entity: A) {
  assertRuntype(entity);
  return create<Brand<B, A>>(
    'brand',
    (value, _innerValidate, innerValidateToPlaceholder) =>
      innerValidateToPlaceholder(entity, value) as any,
    {
      brand,
      entity,
      show(needsParens) {
        return show(entity, needsParens);
      },
    },
  );
}
