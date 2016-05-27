import assert from 'assert'

import Fun from './function'

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


describe('Fun', () => {

  ifCheckingIt('must be given valid parameter types',
    () => Fun('oops'),
    errNotAType('oops')
  )

  ifCheckingIt('must be given a valid result type',
    () => Fun()('oops'),
    errNotAType('oops')
  )

  ifCheckingIt('must be given at most one result type',
    () => Fun()(Number, Number),
    errTooManyResultTypes
  )

  const PowType = Fun(Number, Number)(Number)

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
  //   () => Fun()()//.wrap(function () {})('hi')
  // )
})
