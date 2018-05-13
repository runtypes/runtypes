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
  return create<Brand<B, A>>(x => entity.check(x) as Static<Brand<B, A>>, {
    tag: 'brand',
    brand,
    entity,
  });
}
