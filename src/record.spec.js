import assert from 'assert'

import Record from './record'

import {
  errNotAType,
  errWrongType,
  errMissingRecordFields,
  errExtraneousRecordFields,
  errBadRecordFieldValue,
  errAttemptedFieldMutation,
  errGetNonexistentRecordField
} from './errorMessages'

import {
  ifCheckingIt,
  whetherCheckingOrNotIt
} from './testUtil.js'

const Point = Record({
  x: Number,
  y: Number
})

describe('Record', () => {
  whetherCheckingOrNotIt('gives access to fields', () => {
    const p = Point({
      x: 3,
      y: 10
    })
    assert.equal(3, p.x)
    assert.equal(10, p.y)
  })

  ifCheckingIt('must be constructed with a valid type specification',
    () => Record({ foo: 3 }),
    errNotAType(3)
  )

  ifCheckingIt('must be constructed with all fields',
    () => Point({ x: 5 }),
    errMissingRecordFields(['y'])
  )

  ifCheckingIt('cannot be constructed with extra fields',
    () => Point({ x: 5, y: 9, z: 4 }),
    errExtraneousRecordFields(['z'])
  )

  ifCheckingIt('requires fields to have correct type',
    () => Point({ x: 5, y: 'hi' }),
    errBadRecordFieldValue('hi', 'y', errWrongType(Number))
  )

  ifCheckingIt('prohibits mutation',
    () => { Point({ x: 5, y: 2}).x = 'hi' },
    errAttemptedFieldMutation
  )

  ifCheckingIt('prohibits adding fields',
    () => { Point({ x: 5, y: 2}).x = 'hi' },
    errAttemptedFieldMutation
  )

  ifCheckingIt('prohibits attempts to get non-existent fields',
    () => Point({ x: 5, y: 2}).z,
    errGetNonexistentRecordField('z', ['x', 'y'])
  )
})
