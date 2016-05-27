import assert from 'assert'

import {
  typesEqual,
  inferType
} from './check'

describe('type inference', () => {
  it('infers primitive types', () => {
    assert(typesEqual(Number, inferType(99)))
    assert(typesEqual(String, inferType('hello')))
    assert(typesEqual(Boolean, inferType(true)))
  })
})
