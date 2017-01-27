import { Validator, anything, nothing, boolean, number, string, literal, array, record, tuple, union } from './index'


const boolTuple = tuple(boolean, boolean, boolean)
const record1 = record({ boolean, number })
const union1 = union(literal(3), string, boolTuple, record1)

const validators = {
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

type ValidatorName = keyof typeof validators

const validatorNames = Object.keys(validators) as ValidatorName[]

const testValues: { value: {}, passes: ValidatorName[] }[] = [
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
    const shouldPass: { [_ in ValidatorName]?: boolean } = { anything: true }
    for (const name of passes)
      shouldPass[name] = true

    for (const name of validatorNames) {
      if (shouldPass[name]) {
        it(`is assignable to type ${name}`, () => assertAccepts(value, validators[name]))
      } else {
        it(`is not assignable to type ${name}`, () => assertRejects(value, validators[name]))
      }
    }
  })
}

function assertAccepts<A>(value: {}, validator: Validator<A>) {
  const result = validator.validate(value)
  if (result.success === false)
    fail(result.message)
}

function assertRejects<A>(value: {}, validator: Validator<A>) {
  const result = validator.validate(value)
  if (result.success === true)
    fail('value passed validation even though it was not expected to')
}
