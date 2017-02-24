import { Runtype } from './types/runtype'
import { Always, always } from './types/always'
import { Never } from './types/never'
import { Void } from './types/void'
import { Literal, LiteralBase } from './types/literal'
import { Boolean } from './types/boolean'
import { Number } from './types/number'
import { String } from './types/string'
import { Record } from './types/record'
import { Optional } from './types/optional'
import { StringDictionary, NumberDictionary } from './types/dictionary'
import { Function } from './types/function'

export type Reflect =
  | Always
  | Never
  | Void
  | Boolean
  | Number
  | String
  | Literal<LiteralBase>
  | { tag: 'array'; Element: Reflect } & Runtype<always[]>
  | Record<{ [_ in string]: Reflect }>
  | Optional<{ [_ in string]: Reflect }>
  | StringDictionary<any>
  | NumberDictionary<any>
  | { tag: 'tuple'; Components: Reflect[] } & Runtype<[always]>
  | { tag: 'union'; Alternatives: Reflect[] } & Runtype<always>
  | { tag: 'intersect'; Intersectees: Reflect[] } & Runtype<always>
  | Function
  | { tag: 'constraint'; Underlying: Reflect } & Runtype<always>
