import {
  Unknown,
  Never,
  Undefined,
  Null,
  Boolean,
  Number,
  String,
  Symbol,
  Literal,
  Array,
  Record,
  Object,
  Partial,
  Tuple,
  Union,
  Intersect,
  Function,
  Lazy,
  InstanceOf,
} from '.';
import show from './show';
import { RuntypeBase } from './runtype';

class TestClass {}

const cases: [RuntypeBase, string][] = [
  [Unknown, 'unknown'],
  [Never, 'never'],
  [Undefined, 'undefined'],
  [Null, 'null'],
  [Boolean, 'boolean'],
  [Number, 'number'],
  [String, 'string'],
  [Symbol, 'symbol'],
  [Literal(true), 'true'],
  [Literal(3), '3'],
  [Literal('foo'), '"foo"'],
  [Array(String), 'string[]'],
  [Array(String).asReadonly(), 'readonly string[]'],
  [Record(String, Array(Boolean)), '{ [_: string]: boolean[] }'],
  [Record(String, Array(Boolean)), '{ [_: string]: boolean[] }'],
  [Record(Number, Array(Boolean)), '{ [_: number]: boolean[] }'],
  [Object({}), '{}'],
  [Object({}).asReadonly(), '{}'],
  [Partial({}), '{}'],
  [InstanceOf(TestClass), 'InstanceOf<TestClass>'],
  [Array(InstanceOf(TestClass)), 'InstanceOf<TestClass>[]'],
  [Object({ x: String, y: Array(Boolean) }), '{ x: string; y: boolean[]; }'],
  [Object({ x: String, y: Array(Boolean) }), '{ x: string; y: boolean[]; }'],
  [Object({ x: Number }).And(Partial({ y: Number })), '{ x: number; } & { y?: number; }'],
  [
    Object({ x: String, y: Array(Boolean) }).asReadonly(),
    '{ readonly x: string; readonly y: boolean[]; }',
  ],
  [Object({ x: String, y: Array(Boolean).asReadonly() }), '{ x: string; y: readonly boolean[]; }'],
  [
    Object({ x: String, y: Array(Boolean).asReadonly() }).asReadonly(),
    '{ readonly x: string; readonly y: readonly boolean[]; }',
  ],
  [Partial({ x: String, y: Array(Boolean) }), '{ x?: string; y?: boolean[]; }'],
  [Object({ x: String, y: Array(Boolean) }).asPartial(), '{ x?: string; y?: boolean[]; }'],
  [Tuple(Boolean, Number), '[boolean, number]'],
  [Union(Boolean, Number), 'boolean | number'],
  [Intersect(Boolean, Number), 'boolean & number'],
  [Function, 'function'],
  [Lazy(() => Boolean), 'boolean'],
  [Number.withConstraint(x => x > 3), 'WithConstraint<number>'],
  [Number.withBrand('someNumber'), 'number'],
  [Number.withBrand('someNumber').withConstraint(x => x > 3), 'WithConstraint<number>'],

  // Parenthesization
  [Boolean.And(Number.Or(String)), 'boolean & (number | string)'],
  [Boolean.Or(Number.And(String)), 'boolean | (number & string)'],
  [Boolean.Or(Object({ x: String, y: Number })), 'boolean | { x: string; y: number; }'],
];

for (const [T, expected] of cases) {
  const s = show(T);
  it(s, () => {
    expect(s).toBe(expected);
    expect(T.toString()).toBe(`Runtype<${s}>`);
  });
}
