import { check } from './settings'

import {
  checkType,
  isType
} from './check'

import {
  errNotAType,
  errTooManyResultTypes,
  errWrappingNonFunction,
  errNumArgs,
  errBadArg,
  errBadResult
} from './messages'

export default function (...paramTypes) {

  if (check()) {
    // Validate that each param type is in fact a type
    for (let i = 0; i < paramTypes.length; i++) {
      const paramType = paramTypes[i]
      if (!isType(paramType))
        throw new TypeError(errNotAType(paramType))
    }
  }

  return function (...resultTypes) {

    // FIXME handle no resultType provided (implicit Void)
    const resultType = resultTypes[0]

    if (check()) {
      if (resultTypes.length > 1)
        throw new TypeError(errTooManyResultTypes)

      if (!isType(resultType))
        throw new TypeError(errNotAType(resultType))
    }

    return {
      checking(f) {
        if (!check())
          return f

        if (typeof f !== 'function')
          throw new TypeError(errWrappingNonFunction(f))

        return function (...args) {
          // Num args check
          if (args.length !== paramTypes.length)
            throw new TypeError(errNumArgs(paramTypes.length, args.length))

          // Per-argument validation
          for (let i = 0; i < args.length; i++) {
            const arg = args[i]
            const type = paramTypes[i]
            const errMsg = checkType(arg, type)
            if (errMsg)
              throw new TypeError(errBadArg(arg, i, errMsg))
          }

          const result = f.apply(null, args)

          const errMsg = checkType(result, resultType)
          if (errMsg)
            throw new TypeError(errBadResult(errMsg))

          return result
        }
      }
    }
  }
}
