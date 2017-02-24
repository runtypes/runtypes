import { Runtype } from './runtype'
import { always } from './types/always'
import { LiteralBase } from './types/literal'

export type Reflect =
  | { tag: 'always' } & Runtype<always>
  | { tag: 'never' } & Runtype<never>
  | { tag: 'void' } & Runtype<void>
  | { tag: 'boolean' } & Runtype<boolean>
  | { tag: 'number' } & Runtype<number>
  | { tag: 'string' } & Runtype<string>
  | { tag: 'literal'; value: LiteralBase } & Runtype<LiteralBase>
  | { tag: 'array'; Element: Reflect } & Runtype<always[]>
  | { tag: 'record'; Fields: { [_: string]: Reflect } } & Runtype<{ [_ in string]: always }>
  | { tag: 'optional'; Fields: { [_: string]: Reflect } } & Runtype<{ [_ in string]?: always }>
  | { tag: 'dictionary'; keyType: 'string' | 'number' } & Runtype<{ [_: string]: always }>
  | { tag: 'tuple'; Components: Reflect[] } & Runtype<[always]>
  | { tag: 'union'; Alternatives: Reflect[] } & Runtype<always>
  | { tag: 'intersect'; Intersectees: Reflect[] } & Runtype<always>
  | { tag: 'function' } & Runtype<(...args: any[]) => any>
  | { tag: 'constraint'; Underlying: Reflect } & Runtype<always>
