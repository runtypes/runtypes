import { Contract } from './index'
import {
  Runtype,
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
  Record,
  Optional,
  Tuple,
  Union,
  Intersect,
  Function,
  Lazy,
  Static,
} from './index'

type Always = Static<typeof Always>

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

const testValues: { value: Always, passes: RuntypeName[] }[] = [
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

function assertAccepts<A>(value: Always, runtype: Runtype<A>) {
  const result = runtype.validate(value)
  if (result.success === false)
    fail(result.message)
}

function assertRejects<A>(value: Always, runtype: Runtype<A>) {
  const result = runtype.validate(value)
  if (result.success === true)
    fail('value passed validation even though it was not expected to')
}
