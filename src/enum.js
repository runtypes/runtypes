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

export const settings = {
  check: true,
  checkExhaustive: true,
  checkExtraneous: true
}

export const Enum = (spec) => {
  const type = {}
  for (const ctorName in spec) {
    type[ctorName] = (...args) => {
      
      const paramTypes = spec[ctorName]
      
      const { check, checkExhaustive, checkExtraneous } = settings
      
      if (check) {
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
        if (check) {
          if (checkExtraneous) {
            for (const caseName in cases) {
              if (!(caseName in spec))
                throw new TypeError(errInvalidCaseName(caseName, Object.keys(spec)))
            }
          }
          
          if (checkExhaustive) {
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
