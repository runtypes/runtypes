import assert from 'assert'

import Record from './record'
import {
  re,

  errWrongType,
  errMissingRecordFields,
  errExtraneousRecordFields,
  errBadRecordFieldValue,
  errAttemptedFieldMutation
} from './util'

const Point = Record({
  x: Number,
  y: Number
})

describe('Record', () => {
  it('gives access to fields', () => {
    const p = Point({
      x: 3,
      y: 10
    })
    assert.equal(3, p.x)
    assert.equal(10, p.y)
  })

  it('requires all fields', () => {
    assert.throws(() => {
      Point({ x: 5 })
    }, re(errMissingRecordFields(['y'])))
  })

  it('does not allow extra fields', () => {
    assert.throws(() => {
      Point({ x: 5, y: 9, z: 4 })
    }, re(errExtraneousRecordFields(['z'])))
  })

  it('requires fields to have correct type', () => {
    assert.throws(() => {
      Point({ x: 5, y: 'hi' })
    }, re(errBadRecordFieldValue('hi', 'y', errWrongType(Number))))
  })

  it('prohibits mutation', () => {
    const p = Point({ x: 5, y: 2})
    assert.throws(() => {
      p.x = 'hi'
    }, /Cannot assign/)
    assert.equal(5, p.x)
  })
})
