import { Validator, anything, nothing, boolean, number, string, literal, array, record, tuple, union } from './index'


const boolTuple = tuple(boolean, boolean, boolean)
const object1 = record({ boolean, number })
const union1 = union(literal(3), string, boolTuple, object1)

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
  object1,
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
  { value: { boolean: true, number: 3 }, passes: ['object1', 'union1'] },
]

type TestConfig = {
  [_ in ValidatorName]: {
    goodValues: {}[]
    badValues: {}[]
  }
}

const testConfigs: TestConfig = {} as TestConfig
for (const name of validatorNames)
  testConfigs[name] = { goodValues: [], badValues: [] }
for (const { value, passes } of testValues) {
  const validatorStatus: { [_ in ValidatorName]?: boolean } = {}
  validatorStatus.anything = true
  for (const name of passes)
    validatorStatus[name] = true
  for (const name of validatorNames)
    testConfigs[name][validatorStatus[name] ? 'goodValues' : 'badValues'].push(value)
}

for (const name of validatorNames) {
  describe(name, () => {
    const { goodValues, badValues } = testConfigs[name]
    const validator = validators[name]
    for (const value of goodValues)
      succeeds(value, validator)
    for (const value of badValues)
      fails(value, validator)
  })
}

// describe('anything', () => {
//   succeeds(true, anything)
//   succeeds(3, anything)
//   succeeds('hi', anything)
// })

// describe('nothing', () => {
//   fails(true, nothing)
//   fails(3, nothing)
//   fails('hi', nothing)
// })

// describe('boolean', () => {
//   succeeds(true, boolean)
//   succeeds(false, boolean)
//   fails(3, boolean)
//   fails('hi', boolean)
// })

// describe('boolean literal', () => {
//   const validator = literal(true)
//   succeeds(true, validator)
//   fails(false, validator)
//   fails(3, validator)
//   fails('hi', validator)
// })

// describe('number', () => {
//   fails(true, number)
//   succeeds(3, number)
//   fails('hi', number)
// })

// describe('string', () => {
//   fails(true, string)
//   fails(3, string)
//   succeeds('hi', string)
// })

function succeeds<A>(value: {}, validator: Validator<A>) {
  it(JSON.stringify(value), () => {
    const result = validator.validate(value)
    if (result.success === false)
      fail(result.message)
  })
}

function fails<A>(value: {}, validator: Validator<A>) {
  it(JSON.stringify(value), () => {
    const result = validator.validate(value)
    if (result.success === true)
      fail('erroneously passed validation')
  })
}
