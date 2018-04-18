import { Runtype, create, validationError } from '../runtype';

export interface Constructor<V> {
  new (...args: any[]): V;
}

export interface InstanceOf<V> extends Runtype<V> {
  tag: 'instanceof';
  ctor: Constructor<V>;
}

export function InstanceOf<V>(ctor: Constructor<V>) {
  return create<InstanceOf<V>>(
    x => {
      if (!(x instanceof ctor)) {
        throw validationError(`Expected ${(ctor as any).name}, but was ${typeof x}`);
      }
      return x as V;
    },
    { tag: 'instanceof', ctor: ctor },
  );
}
