import assert from 'assert'

import settings from './settings'
import Enum from './enum'
import {
  checkType,

  errNoNullOrUndefined,
  errNumCtorArgs,
  errBadCtorArg,
  errWrongType,
  errInvalidCaseName,
  errExhaustiveness,
  errMissingCase
} from './util'

// Convert a string to a regexp, escaping all special characters inside it
const re = str => new RegExp(str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"))

const Maybe = T => Enum({
    Nothing: [],
    Just: [T]
})

describe('Enum', () => {
  it('performs case analysis', () => {
    const maybe = Maybe(Number).Just(3)
    assert.equal(4, maybe({
      Just(n) { return n + 1 },
      Nothing() { return 'oops' }
    }))
  })

  it('does not accept null or undefined arguments', () => {
    assert.throws(() => {
      Maybe(Number).Just(null)
    }, re(errNoNullOrUndefined))
    assert.throws(() => {
      Maybe(Number).Just(undefined)
    }, re(errNoNullOrUndefined))
  })

  it('requires the correct number of arguments', () => {
    assert.throws(() => {
      Maybe(Number).Just()
    }, re(errNumCtorArgs(1, 0)))

    assert.throws(() => {
      Maybe(Number).Just(1, 'foo')
    }, re(errNumCtorArgs(1, 2)))
  })

  it('requires arguments of the right type', () => {
    assert.throws(() => {
      Maybe(Number).Just('foo')
    }, re(errBadCtorArg('foo', 0, 'Just', errWrongType(Number))))
  })

  it('rejects extraneous cases', () => {
    assert.throws(() => {
      const just9 = Maybe(Number).Just(9)
      just9({
        Nothing() {
          return 4
        },
        Just(x) {
          return x + 9
        },
        Bogus(y) {
          return 3
        }
      })
    }, re(errInvalidCaseName('Bogus', ['Nothing', 'Just'])))
  })

  it('checks exhaustiveness', () => {
    assert.throws(() => {
      const just9 = Maybe(Number).Nothing()
      just9({
        Nothing() {
          return 4
        }
      })
    }, re(errExhaustiveness(['Just'])))
  })

  it('checks that just the right case is present when exhaustiveness is turned off', () => {
    settings.checkExhaustive = false
    assert.throws(() => {
      const just9 = Maybe(Number).Just(9)
      just9({
        Nothing() {
          return 4
        }
      })
    }, re(errMissingCase('Just')))
    settings.checkExhaustive = true
  })
})
