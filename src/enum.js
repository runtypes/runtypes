import Settings from './settings'

import {
  isType,
  checkType
} from './check'

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
} from './errorMessages'

export default (spec) => {

  const type = {}

  for (const ctorName in spec) {

    const paramTypes = spec[ctorName]

    if (Settings.check) {
      // Validate that the constructor was specified with an array of type params
      if (!Array.isArray(paramTypes))
        throw new TypeError(errNotACtorTypeArray(paramTypes))

      // Validate that each param type is in fact a type
      for (let i = 0; i < paramTypes.length; i++) {
        const paramType = paramTypes[i]
        if (!isType(paramType))
          throw new TypeError(errNotAType(paramType))
      }
    }

    type[ctorName] = (...args) => {

      if (Settings.check) {
        // Num args check
        if (args.length !== paramTypes.length)
          throw new TypeError(errNumCtorArgs(paramTypes.length, args.length))

        // Per-argument validation
        for (let i = 0; i < args.length; i++) {
          const arg = args[i]
          const type = paramTypes[i]
          const errMsg = checkType(arg, type)
          if (errMsg)
            throw new TypeError(errBadCtorArg(arg, i, ctorName, errMsg))
        }
      }

      // A value of an enum type is nothing more than the case function
      // which analyzes it
      return (cases) => {
        if (Settings.check) {
          if (Settings.checkExtraneous) {
            for (const caseName in cases) {
              if (!(caseName in spec))
                throw new TypeError(errInvalidCaseName(caseName, Object.keys(spec)))
            }
          }

          if (Settings.checkExhaustive) {
            const missingCases = []

            for (const caseName in spec)
              if (!(caseName in cases))
                missingCases.push(caseName)

            if (missingCases.length > 0)
              throw new TypeError(errExhaustiveness(missingCases.reverse()))
          }
        }

        const handler = cases[ctorName]

        if (!handler)
          throw new TypeError(errMissingCase(ctorName))

        return handler.apply(null, args)
      }
    }
  }
  return type
}
