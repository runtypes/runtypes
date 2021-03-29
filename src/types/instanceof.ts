import { Failcode } from '../result';
import { Runtype, create } from '../runtype';
import { FAILURE, SUCCESS, typeOf } from '../util';

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
        ? SUCCESS(value)
        : FAILURE(
            Failcode.TYPE_INCORRECT,
            `Expected ${(ctor as any).name}, but was ${typeOf(value)}`,
          ),
    { tag: 'instanceof', ctor: ctor },
  );
}
