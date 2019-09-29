import { Runtype, create } from '../runtype';

export interface Constructor<V> {
  new (...args: any[]): V;
}

export interface InstanceOf<V> extends Runtype<V> {
  tag: 'instanceof';
  ctor: Constructor<V>;
}

export function InstanceOf<V>(ctor: Constructor<V>) {
  return create<InstanceOf<V>>(
    value =>
      value instanceof ctor
        ? { success: true, value }
        : {
            success: false,
            message: `Expected ${(ctor as any).name}, but was ${
              value === null ? value : typeof value
            }`,
          },
    { tag: 'instanceof', ctor: ctor },
  );
}
