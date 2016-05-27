import assert from 'assert'

import { requireExhaustiveCases } from './settings'
import Enum from './enum'

import {
  ifCheckingIt,
  whetherCheckingOrNotIt,
  assertThrowsExact
} from './testUtil'

import {
  errNoNullOrUndefined,
  errNotAType,
  errNotACtorTypeArray,
  errNumCtorArgs,
  errBadCtorArg,
  errWrongType,
  errInvalidCaseName,
  errExhaustiveness,
  errMissingCase
} from './messages'

const Maybe = T => Enum({
  Nothing: [],
  Just: [T]
})

const { Just: JustNum, Nothing: NothingNum } = Maybe(Number)

describe('Enum', () => {
  whetherCheckingOrNotIt('performs case analysis', () => {
    const maybe = JustNum(3)
    assert.equal(4, maybe.match({
      Just(n) { return n + 1 },
      Nothing() { return 'oops' }
    }))
  })

  ifCheckingIt('cannot be constructed with null arguments',
    () => JustNum(null),
    errNoNullOrUndefined
  )

  ifCheckingIt('cannot be constructed with undefined arguments',
    () => JustNum(undefined),
    errNoNullOrUndefined
  )

  ifCheckingIt('must be constructed with all arguments',
    () => JustNum(),
    errNumCtorArgs(1, 0)
  )

  ifCheckingIt('must not be constructed with extra arguments',
    () => JustNum(1, 'foo'),
    errNumCtorArgs(1, 2)
  )

  ifCheckingIt('must be constructed with arguments of the right type',
    () => JustNum('foo'),
    errBadCtorArg('foo', 0, 'Just', errWrongType(Number))
  )

  ifCheckingIt('rejects extraneous cases',
    () => {
      const just9 = JustNum(9)
      just9.match({
        Nothing() {
          return 4
        },
        Just(x) {
          return x + 9
        },
        Bogus() {
          return 3
        }
      })
    },
    errInvalidCaseName('Bogus', ['Nothing', 'Just'])
  )

  ifCheckingIt('must be given exhaustive cases',
    () => {
      const just9 = NothingNum()
      just9.match({
        Nothing() {
          return 4
        }
      })
    },
    errExhaustiveness(['Just'])
  )

  it('checks just that the right case is present when exhaustiveness is turned off', () => {
    requireExhaustiveCases(false)
    assertThrowsExact(() => {
      const just9 = JustNum(9)
      just9.match({
        Nothing() {
          return 4
        }
      })
    }, errMissingCase('Just'))
    requireExhaustiveCases(true)
  })

  ifCheckingIt('requires valid type specifications',
    () => Enum({ Foo: [3] }),
    errNotAType(3)
  )

  ifCheckingIt('must be given an array of parameter types per constructor',
    () => Enum({ Foo: true }),
    errNotACtorTypeArray(true)
  )
})
