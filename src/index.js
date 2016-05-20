import assert from 'assert'

const showVal = (val) => {
    return JSON.stringify(val)
}

const showType = (type) => {
    switch (type) {
        case Boolean: return 'Boolean'
        case Number: return 'Number'
        case String: return 'String'
    }
    throw new Error(`unable to show type ${type}`)
}

const typesEqual = (type1, type2) => {
    // TODO structural equality
    return type1 === type2
}

const errNoNullOrUndefined = 'no null or undefined values allowed'
const errNumCtorArgs = (numParams, numArgs) => `wrong number of arguments: expected ${numParams} but was ${numArgs}`
const errBadCtorArg = (arg, argIndex, ctorName, errMsg) => `value ${showVal(arg)} cannot be passed as argument ${argIndex} of constructor ${ctorName}; ${errMsg}`
const errWrongType = (expectedType) => `expected value of type ${showType(expectedType)}`
const errInvalidCaseName = (caseName, validCases) => `${caseName} is not one of the valid constructors for this type (${validCases.join(', ')})`
const errExhaustiveness = (missingCases) => `not all cases handled (missing ${missingCases.join(', ')})`
const errMissingCase = (caseName) => `failed to handle case ${caseName}`

const inferType = (val) => {
    switch (typeof val) {
        case 'boolean': return Boolean
        case 'number': return Number
        case 'string': return String
    }
    throw new Error(`unable to infer type of ${showVal(val)}`)
}

const checkType = (val, expectedType) => {
    if (val === null || val === undefined)
        return errNoNullOrUndefined
    
    const inferredType = inferType(val)
    if (typesEqual(expectedType, inferredType))
        return null // definitely no error in this case
    
    // TODO handle validator functions
    return errWrongType(expectedType)
}

const settings = {
    check: true,
    checkExhaustive: true,
    checkExtraneous: true
}

const Enum = (spec) => {
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
