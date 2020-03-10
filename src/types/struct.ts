import { Runtype, Static } from '../runtype';
import { Maybe } from './maybe';
import { Record as _Record } from './record';
import { Partial as _Partial } from './partial';

type RuntypeDict = { [_: string]: Runtype };

type RequiredPropertyNames<T extends RuntypeDict> = {
  [K in keyof T]: T[K] extends Maybe<any> ? never : K;
}[keyof T];

type OptionalPropertyNames<T extends RuntypeDict> = {
  [K in keyof T]: T[K] extends Maybe<any> ? K : never;
}[keyof T];

type RequiredPropertyValues<T extends RuntypeDict> = {
  [K in keyof T]: T[K] extends Maybe<any> ? never : Static<T[K]>;
};

type OptionalPropertyValues<T extends RuntypeDict> = {
  [K in keyof T]: T[K] extends Maybe<any> ? Static<T[K]> : never;
};

export interface Struct<O extends RuntypeDict>
  extends Runtype<
    { [P in RequiredPropertyNames<O>]: RequiredPropertyValues<O>[P] } &
      { [P in OptionalPropertyNames<O>]?: OptionalPropertyValues<O>[P] }
  > {
  tag: 'struct';
  fields: O;
}

/**
 * Construct a struct runtype from runtypes for its values.
 */
export function Struct<O extends RuntypeDict>(fields: O): Struct<O> {
  const required: any = {};
  const optional: any = {};
  let withOptional = false;
  Object.keys(fields).forEach(key => {
    const rt = fields[key];
    if ((rt as any).tag === 'maybe') {
      optional[key] = rt;
      withOptional = true;
    } else {
      required[key] = rt;
    }
  });

  let base: Struct<O> = _Record(required) as any;
  if (withOptional) {
    base = base.And(_Partial(optional)) as any;
  }
  base.fields = fields;
  base.tag = 'struct';
  return base;
}
