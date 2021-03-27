import { Runtype, Static, create } from '../runtype';

export declare const RuntypeName: unique symbol;

export interface RuntypeBrand<B extends string> {
  [RuntypeName]: B;
}

export interface Brand<B extends string, A extends Runtype>
  extends Runtype<
    // TODO: replace it by nominal type when it has been released
    // https://github.com/microsoft/TypeScript/pull/33038
    Static<A> & RuntypeBrand<B>
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
