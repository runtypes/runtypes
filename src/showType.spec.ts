import {
  Always,
  Never,
  Undefined,
  Null,
  Void,
  Boolean,
  Number,
  String,
  Literal,
  Array,
  Dictionary,
  Record,
  Optional,
  Tuple,
  Union,
  Intersect,
  Function,
  Lazy,
  Constraint,
  AnyRuntype,
} from './index'
import showType from './showType'

const cases: [AnyRuntype, string][] = [
  [Always, 'always'],
  [Never, 'never'],
  [Undefined, 'undefined'],
  [Null, 'null'],
  [Void, 'void'],
  [Boolean, 'boolean'],
  [Number, 'number'],
  [String, 'string'],
  [Literal(true), 'true'],
  [Literal(3), '3'],
  [Literal('foo'), '"foo"'],
  [Array(String), 'string[]'],
  [Dictionary(Always), '{ [_: string]: {} }'],
  [Dictionary(Always, 'number'), '{ [_: number]: {} }'],
  [Record({}), '{}'],
  [
    Record({ x: String, y: Array(Boolean) }),
    '{ x: string; y: boolean[]; }'
  ],
  [
    Optional({ x: String, y: Array(Boolean) }),
    '{ x?: string; y?: boolean[]; }'
  ],
  [
    Tuple(Boolean),
    '[boolean]'
  ],
  [
    Tuple(Boolean, Number),
    '[boolean, number]'
  ],
  [
    Tuple(Boolean, Number, String),
    '[boolean, number, string]'
  ],
  [
    Tuple(Boolean, Number, String, Boolean),
    '[boolean, number, string, boolean]'
  ],
  [
    Tuple(Boolean, Number, String, Boolean, Number),
    '[boolean, number, string, boolean, number]'
  ],
  [
    Tuple(Boolean, Number, String, Boolean, Number, String),
    '[boolean, number, string, boolean, number, string]'
  ],
  [
    Tuple(Boolean, Number, String, Boolean, Number, String, Boolean),
    '[boolean, number, string, boolean, number, string, boolean]'
  ],
  [
    Union(Boolean),
    'boolean'
  ],
  [
    Union(Boolean, Number),
    'boolean | number'
  ],
  [
    Union(Boolean, Number, String),
    'boolean | number | string'
  ],
  [
    Intersect(Boolean),
    'boolean'
  ],
  [
    Intersect(Boolean, Number),
    'boolean & number'
  ],
  [Function, 'function'],
  [Lazy(() => Boolean), 'boolean'],
  [Number.withConstraint(x => x > 3), 'number'],

  // Parenthesization
  [
    Boolean.And(Number.Or(String)),
    'boolean & (number | string)'
  ],
  [
    Boolean.Or(Number.And(String)),
    'boolean | (number & string)'
  ],
  [
    Boolean.Or(Record({ x: String, y: Number })),
    'boolean | { x: string; y: number; }'
  ]
]

for (const [T, expected] of cases) {
  const name = showType(T)
  it(name, () => {
    expect(name).toBe(expected)
  })
}

