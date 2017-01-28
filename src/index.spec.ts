import { Runtype, anything, nothing, boolean, number, string, literal, array, record, tuple, union } from './index'


const boolTuple = tuple(boolean, boolean, boolean)
const record1 = record({ boolean, number })
const union1 = union(literal(3), string, boolTuple, record1)

const runtypes = {
  anything,
  nothing,
  boolean,
  true: literal(true),
  false: literal(false),
  number,
  3: literal(3),
  42: literal(42),
  string,
  'hello world': literal('hello world'),
  boolArray: array(boolean),
  boolTuple,
  record1,
  union1,
}

tuple(boolean, boolean, boolean).coerce([true, false, true])

type RuntypeName = keyof typeof runtypes

const runtypeNames = Object.keys(runtypes) as RuntypeName[]

const testValues: { value: {}, passes: RuntypeName[] }[] = [
  { value: true, passes: ['boolean', 'true'] },
  { value: false, passes: ['boolean', 'false'] },
  { value: 3, passes: ['number', '3', 'union1'] },
  { value: 42, passes: ['number', '42'] },
  { value: 'hello world', passes: ['string', 'hello world', 'union1'] },
  { value: [true, false, true], passes: ['boolArray', 'boolTuple', 'union1'] },
  { value: { boolean: true, number: 3 }, passes: ['record1', 'union1'] },
]

for (const { value, passes } of testValues) {
  describe(JSON.stringify(value), () => {
    const shouldPass: { [_ in RuntypeName]?: boolean } = { anything: true }
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

function assertAccepts<A>(value: {}, runtype: Runtype<A>) {
  const result = runtype.validate(value)
  if (result.success === false)
    fail(result.message)
}

function assertRejects<A>(value: {}, runtype: Runtype<A>) {
  const result = runtype.validate(value)
  if (result.success === true)
    fail('value passed validation even though it was not expected to')
}
