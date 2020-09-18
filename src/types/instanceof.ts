import { expected, success } from '../result';
import { create, Codec } from '../runtype';

export interface Constructor<V> {
  new (...args: any[]): V;
}

export interface InstanceOf<V = unknown> extends Codec<V> {
  readonly tag: 'instanceof';
  readonly ctor: Constructor<V>;
}

export function InstanceOf<V>(ctor: Constructor<V>): InstanceOf<V> {
  return create<InstanceOf<V>>(
    'instanceof',
    value => (value instanceof ctor ? success(value) : expected(`${(ctor as any).name}`, value)),
    {
      ctor: ctor,
      show() {
        return `InstanceOf<${(ctor as any).name}>`;
      },
    },
  );
}
