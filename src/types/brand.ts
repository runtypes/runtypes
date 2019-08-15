import { Runtype, Static, create } from '../runtype';

export const RuntypeName = Symbol('RuntypeName');

export interface Brand<B extends string, A extends Runtype>
  extends Runtype<
    Static<A> & {
      [RuntypeName]: B;
    }
  > {
  tag: 'brand';
  brand: B;
  entity: A;
}

export function Brand<B extends string, A extends Runtype>(brand: B, entity: A) {
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
    },
  );
}
