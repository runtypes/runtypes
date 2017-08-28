import {
  Runtype,
  Static,
  Always, always,
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
  Tuple, Tuple2,
  Union, Union2,
  Intersect, Intersect2,
  Function,
  Lazy,
  Constraint,
  Contract,
  Reflect,
  InstanceOf,
} from './index'

import { Constructor } from "./types/instanceof"

const boolTuple = Tuple(Boolean, Boolean, Boolean)
const record1 = Record({ Boolean, Number })
const union1 = Union(Literal(3), String, boolTuple, record1)

type Person = { name: string, likes: Person[] }
const Person: Runtype<Person> = Lazy(() => Record({ name: String, likes: Array(Person) }))

class SomeClass {}
class SomeOtherClass {}

const runtypes = {
  Always,
  Never,
  Undefined,
  Null,
  Empty: Record({}),
  Void,
  Boolean,
  true: Literal(true),
  false: Literal(false),
  Number,
  3: Literal(3),
  42: Literal(42),
  String,
  'hello world': Literal('hello world'),
  boolArray: Array(Boolean),
  boolTuple,
  record1,
  union1,
  Partial: Partial({ foo: String }).And(Record({ Boolean })),
  Function,
  Person,
  MoreThanThree: Number.withConstraint(n => n > 3),
  MoreThanThreeWithMessage: Number.withConstraint(n => n > 3 || `${n} is not greater than 3`),
  ArrayNumber: Array(Number),
  CustomArray: Array(Number).withConstraint(x => x.length > 3, {tag: 'lenght', min:3}),
  CustomArrayWithMessage: Array(Number).withConstraint(x => x.length > 3 || `Length array is not greater 3`, {tag: 'lenght', min:3}),
  Dictionary: Dictionary(String),
  NumberDictionary: Dictionary(String, 'number'),
  DictionaryOfArrays: Dictionary(Array(Boolean)),
  InstanceOfSomeClass: InstanceOf(SomeClass),
  InstanceOfSomeOtherClass: InstanceOf(SomeOtherClass),
  DictionaryOfArraysOfSomeClass: Dictionary(Array(InstanceOf(SomeClass)))
}

type RuntypeName = keyof typeof runtypes

const runtypeNames = Object.keys(runtypes) as RuntypeName[]

class Foo { x: 'blah' } // Should not be recognized as a Dictionary

const testValues: { value: always, passes: RuntypeName[] }[] = [
  { value: undefined, passes: ['Undefined', 'Void'] },
  { value: null, passes: ['Null', 'Void'] },
  { value: true, passes: ['Boolean', 'true'] },
  { value: false, passes: ['Boolean', 'false'] },
  { value: 3, passes: ['Number', '3', 'union1'] },
  { value: 42, passes: ['Number', '42', 'MoreThanThree', 'MoreThanThreeWithMessage'] },
  { value: 'hello world', passes: ['String', 'hello world', 'union1'] },
  { value: [true, false, true], passes: ['boolArray', 'boolTuple', 'union1'] },
  { value: { Boolean: true, Number: 3 }, passes: ['record1', 'union1', 'Partial'] },
  { value: { Boolean: true }, passes: ['Partial'] },
  { value: { Boolean: true, foo: undefined }, passes: ['Partial'] },
  { value: { Boolean: true, foo: 'hello' }, passes: ['Partial'] },
  { value: { Boolean: true, foo: 5 }, passes: [] },
  { value: (x: number, y: string) => x + y.length, passes: ['Function'] },
  { value: { name: 'Jimmy', likes: [{ name: 'Peter', likes: [] }] }, passes: ['Person'] },
  { value: { a: '1', b: '2' }, passes: ['Dictionary'] },
  { value: ['1', '2'], passes: ['NumberDictionary'] },
  { value: { 1: '1', 2: '2' }, passes: ['Dictionary', 'NumberDictionary'] },
  { value: { a: [], b: [true, false] }, passes: ['DictionaryOfArrays'] },
  { value: new Foo(), passes: [] },
  { value: [1, 2, 4], passes: ['ArrayNumber'] },
  { value: { Boolean: true, Number: '5' }, passes: ['Partial'] },
  { value: [1, 2, 3, 4], passes: ['ArrayNumber', 'CustomArray', 'CustomArrayWithMessage'] },
  { value: new SomeClass(), passes: ['InstanceOfSomeClass'] },
  { value: {xxx: [new SomeClass()]}, passes: ['DictionaryOfArraysOfSomeClass'] }
]

for (const { value, passes } of testValues) {
  const valueName = value === undefined ? 'undefined' : JSON.stringify(value)
  describe(valueName, () => {
    const shouldPass: { [_ in RuntypeName]?: boolean } = {}

    shouldPass.Always = true

    if (value !== undefined && value !== null)
      shouldPass.Empty = true

    for (const name of passes)
      shouldPass[name] = true

    for (const name of runtypeNames) {
      if (shouldPass[name]) {
        it(` : ${name}`, () => assertAccepts(value, runtypes[name]))
      } else {
        it(`~: ${name}`, () => assertRejects(value, runtypes[name]))
      }
    }
  })
}

describe('contracts', () => {
  it('0 args', () => {
    const f = () => 3
    expect(Contract(Number).enforce(f)()).toBe(3)
    try {
      Contract(String).enforce(f as any)()
      fail('contract was violated but no exception was thrown')
    } catch (e) {/* success */}
  })

  it('1 arg', () => {
    const f = (x: string) => x.length
    expect(Contract(String, Number).enforce(f)('hel')).toBe(3)
    try {
      ;(Contract(String, Number).enforce(f) as any)(3)
      fail('contract was violated but no exception was thrown')

      ;(Contract(String, String).enforce(f as any))('hi')
      fail('contract was violated but no exception was thrown')
    } catch (e) {/* success */}
  })

  it('2 args', () => {
    const f = (x: string, y: boolean) => y ? x.length : 4
    expect(Contract(String, Boolean, Number).enforce(f)('hello', false)).toBe(4)
    try {
      ;(Contract(String, Boolean, Number).enforce(f) as any)('hello')
      fail('contract was violated but no exception was thrown')

      ;(Contract(String, Boolean, Number).enforce(f) as any)('hello', 3)
      fail('contract was violated but no exception was thrown')
    } catch (e) {/* success */}
  })
})

describe('reflection', () => {
  const X = Literal('x')
  const Y = Literal('y')

  it('always', () => {
    expectLiteralField(Always, 'tag', 'always')
  })

  it('never', () => {
    expectLiteralField(Never, 'tag', 'never')
  })

  it('void', () => {
    expectLiteralField(Void, 'tag', 'void')
  })

  it('boolean', () => {
    expectLiteralField(Boolean, 'tag', 'boolean')
  })

  it('number', () => {
    expectLiteralField(Number, 'tag', 'number')
  })

  it('string', () => {
    expectLiteralField(String, 'tag', 'string')
  })

  it('literal', () => {
    expectLiteralField(X, 'tag', 'literal')
    expectLiteralField(X, 'value', 'x')
  })

  it('array', () => {
    expectLiteralField(Array(X), 'tag', 'array')
    expectLiteralField(Array(X).element, 'tag', 'literal')
    expectLiteralField(Array(X).element, 'value', 'x')
  })

  it('tuple', () => {
    expectLiteralField(Tuple(X, X), 'tag', 'tuple')
    expect(Tuple(X, X).components.map(C => C.tag)).toEqual(['literal', 'literal'])
    expect(Tuple(X, X).components.map(C => C.value)).toEqual(['x', 'x'])
  })

  it('string dictionary', () => {
    const Rec = Dictionary(Always)
    expectLiteralField(Rec, 'tag', 'dictionary')
    expectLiteralField(Rec, 'key', 'string')
  })

  it('number dictionary', () => {
    const Rec = Dictionary(Always, 'number')
    expectLiteralField(Rec, 'tag', 'dictionary')
    expectLiteralField(Rec, 'key', 'number')
  })

  it('record', () => {
    const Rec = Record({ x: Number, y: Literal(3) })
    expectLiteralField(Rec, 'tag', 'record')
    expectLiteralField(Rec.fields.x, 'tag', 'number')
    expectLiteralField(Rec.fields.y, 'tag', 'literal')
    expectLiteralField(Rec.fields.y, 'value', 3)
  })

  it('partial', () => {
    const Opt = Partial({ x: Number, y: Literal(3) })
    expectLiteralField(Opt, 'tag', 'partial')
    expectLiteralField(Opt.fields.x, 'tag', 'number')
    expectLiteralField(Opt.fields.y, 'tag', 'literal')
    expectLiteralField(Opt.fields.y, 'value', 3)
  })

  it('union', () => {
    expectLiteralField(Union(X, Y), 'tag', 'union')
    expectLiteralField(Union(X, Y), 'tag', 'union')
    expect(Union(X, Y).alternatives.map(A => A.tag)).toEqual(['literal', 'literal'])
    expect(Union(X, Y).alternatives.map(A => A.value)).toEqual(['x', 'y'])
  })

  it('intersect', () => {
    expectLiteralField(Intersect(X, Y), 'tag', 'intersect')
    expectLiteralField(Intersect(X, Y), 'tag', 'intersect')
    expect(Intersect(X, Y).intersectees.map(A => A.tag)).toEqual(['literal', 'literal'])
    expect(Intersect(X, Y).intersectees.map(A => A.value)).toEqual(['x', 'y'])
  })

  it('function', () => {
    expectLiteralField(Function, 'tag', 'function')
  })

  it('lazy', () => {
    const L = Lazy(() => X)
    expectLiteralField(L, 'tag', 'literal')
    expectLiteralField(L, 'value', 'x')
  })

  it('constraint', () => {
    const C = Number.withConstraint(n => n > 9)
    expectLiteralField(C, 'tag', 'constraint')
    expectLiteralField(C.underlying, 'tag', 'number')
  })

  it('instanceof', () => {
    class Test {}
    expectLiteralField(InstanceOf(Test), "tag", "instanceof")
    expectLiteralField(Dictionary(Array(InstanceOf(Test))), "tag", "dictionary")
  })
}) 

// Static tests of reflection
;(
  X:
  | Always
  | Never
  | Void
  | Boolean
  | Number
  | String
  | Literal<boolean | number | string>
  | Array<Reflect>
  | Record<{ [_ in string]: Reflect }>
  | Partial<{ [_ in string]: Reflect }>
  | Tuple2<Reflect, Reflect>
  | Union2<Reflect, Reflect>
  | Intersect2<Reflect, Reflect>
  | Function
  | Constraint<Reflect, any>
  | InstanceOf<Constructor>
): Reflect => {
  const check = <A>(X: Runtype<A>): A => X.check({})
  switch (X.tag) {
    case 'always':
      check<always>(X)
      break
    case 'never':
      check<never>(X)
      break
    case 'void':
      check<void>(X)
      break
    case 'boolean':
      check<boolean>(X)
      break
    case 'number':
      check<number>(X)
      break
    case 'string':
      check<string>(X)
      break
    case 'literal':
      check<typeof X.value>(X)
      break
    case 'array':
      check<(Static<typeof X.element>)[]>(X)
      break
    case 'record':
      check<{ [K in keyof typeof X.fields]: Static<typeof X.fields['K']> }>(X)
      break
    case 'partial':
      check<{ [K in keyof typeof X.fields]?: Static<typeof X.fields['K']> }>(X)
      break
    case 'tuple':
      check<[Static<typeof X.components[0]>, Static<typeof X.components[1]>]>(X)
      break
    case 'union':
      check<Static<typeof X.alternatives[0]> | Static<typeof X.alternatives[1]>>(X)
      break
    case 'intersect':
      check<Static<typeof X.intersectees[0]> & Static<typeof X.intersectees[1]>>(X)
      break
    case 'function':
      check<(...args: any[]) => any>(X)
      break
    case 'constraint':
      check<Static<typeof X.underlying>>(X)
      break;
    case 'instanceof':
      check<typeof X.ctor>(X)
      break;
  }

  return X
}

function expectLiteralField<O, K extends keyof O, V extends O[K]>(o: O, k: K, v: V) {
  expect(o[k]).toBe(v)
}

function assertAccepts<A>(value: always, runtype: Runtype<A>) {
  const result = runtype.validate(value)
  if (result.success === false)
    fail(result.message)
}

function assertRejects<A>(value: always, runtype: Runtype<A>) {
  const result = runtype.validate(value)
  if (result.success === true)
    fail('value passed validation even though it was not expected to')
}
