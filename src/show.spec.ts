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
  Partial,
  Tuple,
  Union,
  Intersect,
  Function,
  Lazy,
  InstanceOf,
  Reflect,
} from './index'
import show from './show'

class TestClass {}

const cases: [Reflect, string][] = [
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
  [Dictionary(Array(Boolean)), '{ [_: string]: boolean[] }'],
  [Dictionary(Array(Boolean), 'string'), '{ [_: string]: boolean[] }'],
  [Dictionary(Array(Boolean), 'number'), '{ [_: number]: boolean[] }'],
  [Record({}), '{}'],
  [Partial({}), '{}'],
  [InstanceOf(TestClass), "InstanceOf<TestClass>"],
  [Array(InstanceOf(TestClass)), "InstanceOf<TestClass>[]"],
  [
    Record({ x: String, y: Array(Boolean) }),
    '{ x: string; y: boolean[]; }'
  ],
  [
    Partial({ x: String, y: Array(Boolean) }),
    '{ x?: string; y?: boolean[]; }'
  ],
  [
    Tuple(Boolean, Number),
    '[boolean, number]'
  ],
  [
    Union(Boolean, Number),
    'boolean | number'
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
  const s = show(T)
  it(s, () => {
    expect(s).toBe(expected)
    expect(T.toString()).toBe(`Runtype<${s}>`)
  })
}

