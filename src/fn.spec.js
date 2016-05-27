import assert from 'assert'

import Fn from './fn'

import {
  checkType
} from './check'

import {
  errNotAType,
  errTooManyResultTypes,
  errWrappingNonFunction,
  errNumArgs,
  errBadArg,
  errBadResult
} from './messages'

import {
  ifCheckingIt,
  whetherCheckingOrNotIt
} from './testUtil.js'


describe('Fn', () => {

  ifCheckingIt('must be given valid parameter types',
    () => Fn('oops'),
    errNotAType('oops')
  )

  ifCheckingIt('must be given a valid result type',
    () => Fn()('oops'),
    errNotAType('oops')
  )

  ifCheckingIt('must be given at most one result type',
    () => Fn()(Number, Number),
    errTooManyResultTypes
  )

  const PowType = Fn(Number, Number)(Number)

  ifCheckingIt('requires the wrapped object to be a function',
    () => PowType.checking('oops'),
    errWrappingNonFunction('oops')
  )

  const pow = () => PowType.checking(Math.pow)

  whetherCheckingOrNotIt('computes correct results', () => {
    assert.equal(pow()(2, 3), 8)
  })

  ifCheckingIt('requires correct number of arguments',
    () => pow()(1),
    errNumArgs(2, 1)
  )

  ifCheckingIt('requires correctly-typed arguments',
    () => pow()('oops', 3),
    errBadArg('oops', 0, checkType('oops', Number))
  )

  ifCheckingIt('requires its wrapped function to return a value of the correct type',
    () => PowType.checking((x, y) => `hello ${x} and ${y}`)(3, 9),
    errBadResult(checkType('hi', Number))
  )

  // whetherCheckingOrNotIt('allows an empty result type',
  //   () => Fn()()//.wrap(function () {})('hi')
  // )
})
