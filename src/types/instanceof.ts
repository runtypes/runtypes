import { Reflect } from '../reflect';
import { Runtype, create } from '../runtype';
import { FAILURE, SUCCESS } from '../util';

export interface Constructor<V> {
  new (...args: any[]): V;
}

export interface InstanceOf<V> extends Runtype<V> {
  tag: 'instanceof';
  ctor: Constructor<V>;
}

export function InstanceOf<V>(ctor: Constructor<V>) {
  const self = ({ tag: 'instanceof', ctor } as unknown) as Reflect;
  return create<InstanceOf<V>>(
    value => (value instanceof ctor ? SUCCESS(value) : FAILURE.TYPE_INCORRECT(self, value)),
    self,
  );
}
