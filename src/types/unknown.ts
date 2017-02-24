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

export type Unknown =
  | Always
  | Never
  | Undefined
  | Null
  | Void
  | Boolean
  | Number
  | String
  | Literal<boolean | number | string>
  | { tag: 'array'; Element: Unknown } & Runtype<always[]>
  | Record<{ [_ in string]: Unknown }>
  | Optional<{ [_ in string]: Unknown }>
  | StringDictionary<any>
  | NumberDictionary<any>
  | { tag: 'tuple'; Components: Unknown[] } & Runtype<[always]>
  | { tag: 'union'; Alternatives: Unknown[] } & Runtype<always>
  | { tag: 'intersect'; Intersectees: Unknown[] } & Runtype<always>
  | Function
  | { tag: 'constraint'; Underlying: Unknown } & Runtype<always>
