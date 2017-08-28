import { Runtype } from './runtype'
import { always } from './types/always'
import { LiteralBase } from './types/literal'
import { ConstraintCheck } from './types/constraint'
import { Constructor } from "./types/instanceof"

export type Reflect =
  | { tag: 'always' } & Runtype<always>
  | { tag: 'never' } & Runtype<never>
  | { tag: 'void' } & Runtype<void>
  | { tag: 'boolean' } & Runtype<boolean>
  | { tag: 'number' } & Runtype<number>
  | { tag: 'string' } & Runtype<string>
  | { tag: 'literal'; value: LiteralBase } & Runtype<LiteralBase>
  | { tag: 'array'; element: Reflect } & Runtype<always[]>
  | { tag: 'record'; fields: { [_: string]: Reflect } } & Runtype<{ [_ in string]: always }>
  | { tag: 'partial'; fields: { [_: string]: Reflect } } & Runtype<{ [_ in string]?: always }>
  | { tag: 'dictionary'; key: 'string' | 'number'; value: Reflect } & Runtype<{ [_: string]: always }>
  | { tag: 'tuple'; components: Reflect[] } & Runtype<[always]>
  | { tag: 'union'; alternatives: Reflect[] } & Runtype<always>
  | { tag: 'intersect'; intersectees: Reflect[] } & Runtype<always>
  | { tag: 'function' } & Runtype<(...args: any[]) => any>
  | { tag: 'constraint'; underlying: Reflect; constraint: ConstraintCheck<Reflect>; args?: any } & Runtype<always>
  | { tag: 'instanceof', ctor: Constructor } & Runtype<any>
