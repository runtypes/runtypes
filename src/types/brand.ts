import { RuntypeBase, Static, create, Runtype } from '../runtype';

export const RuntypeName = Symbol('RuntypeName');

export interface Brand<B extends string, A extends RuntypeBase<unknown>>
  extends Runtype<
    Static<A> & {
      [RuntypeName]: B;
    }
  > {
  readonly tag: 'brand';
  readonly brand: B;
  readonly entity: A;
}

export function Brand<B extends string, A extends RuntypeBase<unknown>>(brand: B, entity: A) {
  return create<Brand<B, A>>(
    value => {
      const validated = entity.validate(value);
      return validated.success
        ? { success: true, value: validated.value as Static<Brand<B, A>> }
        : validated;
    },
    {
      tag: 'brand',
      brand,
      entity,
      show({ showChild, needsParens }) {
        return showChild(entity, needsParens);
      },
    },
  );
}
