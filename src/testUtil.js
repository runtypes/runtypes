import assert from 'assert'

import { check } from './settings'

export function whetherCheckingOrNotIt(title, test) {
  it(`${title}`, test)
  it(`${title} if type checking is disabled`, testWithoutChecking(test))
}

export function ifCheckingIt(title, test, expectedErrMsg) {
  it(title, () => {
    assertThrowsExact(test, expectedErrMsg)
  })
  it(`${title} ONLY if type checking is enabled`, testWithoutChecking(test))
}

export function assertThrowsExact(test, errMsg) {
  const re = new RegExp(errMsg.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'))
  assert.throws(test, re)
}

function testWithoutChecking(test) {
  return function() {
    check(false)
    try {
      test()
    } finally {
      check(true)
    }
  }
}
