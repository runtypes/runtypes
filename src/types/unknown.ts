import { Runtype } from './base'
import { Always, always } from './always'
import { Never } from './never'
import { Undefined, Null, Void, Literal } from './literal'
import { Boolean } from './boolean'
import { Number } from './number'
import { String } from './string'
import { Record } from './record'
import { Optional } from './optional'
import { StringDictionary, NumberDictionary } from './dictionary'
import { Function } from './function'

export type AnyRuntype =
  | Always
  | Never
  | Undefined
  | Null
  | Void
  | Boolean
  | Number
  | String
  | Literal<boolean | number | string>
  | { tag: 'array'; Element: AnyRuntype } & Runtype<always[]>
  | Record<{ [_ in string]: AnyRuntype }>
  | Optional<{ [_ in string]: AnyRuntype }>
  | StringDictionary<any>
  | NumberDictionary<any>
  | { tag: 'tuple'; Components: AnyRuntype[] } & Runtype<[always]>
  | { tag: 'union'; Alternatives: AnyRuntype[] } & Runtype<always>
  | { tag: 'intersect'; Intersectees: AnyRuntype[] } & Runtype<always>
  | Function
  | { tag: 'constraint'; Underlying: AnyRuntype } & Runtype<always>
