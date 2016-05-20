import assert from 'assert'

import Record from './record'
import {
  re,

  errMissingRecordKeys,
  errExtraneousRecordKeys
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
  })

  it('requires all fields', () => {
    assert.throws(() => {
      Point({ x: 5 })
    }, re(errMissingRecordKeys(['y'])))
  })

  it('does not allow extra fields', () => {
    assert.throws(() => {
      Point({ x: 5, y: 9, z: 4 })
    }, re(errExtraneousRecordKeys(['z'])))
  })
})
