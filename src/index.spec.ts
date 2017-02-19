import { Contract } from './index'
import {
  Runtype,
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
  Record,
  Optional,
  Tuple,
  Union,
  Intersect,
  Function,
  Lazy,
  Static,
} from './index'

const boolTuple = Tuple(Boolean, Boolean, Boolean)
const record1 = Record({ Boolean, Number })
const union1 = Union(Literal(3), String, boolTuple, record1)

type Person = { name: string, likes: Person[] }
const Person: Runtype<Person> = Lazy(() => Record({ name: String, likes: Array(Person) }))

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
  Partial: Record({ Boolean }).And(Optional({ foo: String })),
  Function,
  Person,
  MoreThanThree: Number.withConstraint(n => n > 3 || `${n} is not greater than 3`)
}

type RuntypeName = keyof typeof runtypes

const runtypeNames = Object.keys(runtypes) as RuntypeName[]

const testValues: { value: always, passes: RuntypeName[] }[] = [
  { value: undefined, passes: ['Undefined', 'Void'] },
  { value: null, passes: ['Null', 'Void'] },
  { value: true, passes: ['Boolean', 'true'] },
  { value: false, passes: ['Boolean', 'false'] },
  { value: 3, passes: ['Number', '3', 'union1'] },
  { value: 42, passes: ['Number', '42', 'MoreThanThree'] },
  { value: 'hello world', passes: ['String', 'hello world', 'union1'] },
  { value: [true, false, true], passes: ['boolArray', 'boolTuple', 'union1'] },
  { value: { Boolean: true, Number: 3 }, passes: ['record1', 'union1', 'Partial'] },
  { value: { Boolean: true }, passes: ['Partial'] },
  { value: { Boolean: true, foo: undefined }, passes: ['Partial'] },
  { value: { Boolean: true, foo: 'hello' }, passes: ['Partial'] },
  { value: (x: number, y: string) => x + y.length, passes: ['Function'] },
  { value: { name: 'Jimmy', likes: [{ name: 'Peter', likes: [] }] }, passes: ['Person'] },
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
      (Contract(String, Number).enforce(f) as any)(3)
      fail('contract was violated but no exception was thrown')

      (Contract(String, String).enforce(f as any))('hi')
      fail('contract was violated but no exception was thrown')
    } catch (e) {/* success */}
  })

  it('2 args', () => {
    const f = (x: string, y: boolean) => y ? x.length : 4
    expect(Contract(String, Boolean, Number).enforce(f)('hello', false)).toBe(4)
    try {
      (Contract(String, Boolean, Number).enforce(f) as any)('hello')
      fail('contract was violated but no exception was thrown')

      (Contract(String, Boolean, Number).enforce(f) as any)('hello', 3)
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

  it('undefined', () => {
    expectLiteralField(Undefined, 'tag', 'undefined')
  })

  it('null', () => {
    expectLiteralField(Null, 'tag', 'null')
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
    expectLiteralField(Array(X).Element, 'tag', 'literal')
    expectLiteralField(Array(X).Element, 'value', 'x')
  })

  it('tuple', () => {
    expectLiteralField(Tuple(X, X), 'tag', 'tuple')
    expect(Tuple(X, X).Components.map(C => C.tag)).toEqual(['literal', 'literal'])
    expect(Tuple(X, X).Components.map(C => C.value)).toEqual(['x', 'x'])
  })

  it('record', () => {
    const Rec = Record({ x: Number, y: Literal(3) })
    expectLiteralField(Rec, 'tag', 'record')
    expectLiteralField(Rec.Fields.x, 'tag', 'number')
    expectLiteralField(Rec.Fields.y, 'tag', 'literal')
    expectLiteralField(Rec.Fields.y, 'value', 3)
  })

  it('optional', () => {
    const Opt = Optional({ x: Number, y: Literal(3) })
    expectLiteralField(Opt, 'tag', 'optional')
    expectLiteralField(Opt.Fields.x, 'tag', 'number')
    expectLiteralField(Opt.Fields.y, 'tag', 'literal')
    expectLiteralField(Opt.Fields.y, 'value', 3)
  })

  it('union', () => {
    expectLiteralField(Union(X, Y), 'tag', 'union')
    expectLiteralField(Union(X, Y), 'tag', 'union')
    expect(Union(X, Y).Alternatives.map(A => A.tag)).toEqual(['literal', 'literal'])
    expect(Union(X, Y).Alternatives.map(A => A.value)).toEqual(['x', 'y'])
  })

  it('intersect', () => {
    expectLiteralField(Intersect(X, Y), 'tag', 'intersect')
    expectLiteralField(Intersect(X, Y), 'tag', 'intersect')
    expect(Intersect(X, Y).Intersectees.map(A => A.tag)).toEqual(['literal', 'literal'])
    expect(Intersect(X, Y).Intersectees.map(A => A.value)).toEqual(['x', 'y'])
  })
})

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
