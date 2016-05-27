const primitives = [
  {
    type: Boolean,
    name: 'Boolean',
    typeOf: 'boolean'
  },
  {
    type: Number,
    name: 'Number',
    typeOf: 'number'
  },
  {
    type: String,
    name: 'String',
    typeOf: 'string'
  }
]

const primByType = new Map(),
      primByTypeOf = new Map()
for (let i = 0; i < primitives.length; i++) {
  const prim = primitives[i]
  primByType.set(prim.type, prim)
  primByTypeOf.set(prim.typeOf, prim)
}

export const showVal = (val) => {
  return JSON.stringify(val)
}

export const isType = (type) => {
  if (primByType.has(type))
    return true

  return false
}

export const showType = (type) => {
  const prim = primByType.get(type)
  if (prim)
    return prim.name
  throw new Error(`unable to show type ${type}`)
}

export const typesEqual = (type1, type2) => {
  // TODO structural equality
  return type1 === type2
}

export const inferType = (val) => {
  const prim = primByTypeOf.get(typeof val)
  if (prim)
    return prim.type
  throw new Error(`unable to infer type of ${showVal(val)}`)
}

export const checkType = (val, expectedType) => {
  if (val === null || val === undefined)
    return errNoNullOrUndefined

  const inferredType = inferType(val)
  if (typesEqual(expectedType, inferredType))
    return null // definitely no error in this case

  // TODO handle validator functions
  return errWrongType(expectedType)
}

// Type error message generators
export const errNoNullOrUndefined = 'no null or undefined values allowed'
export const errNotAType = (purportedType) => `not a type: ${purportedType}`
export const errNotACtorTypeArray = (ctorName) => `constructor ${ctorName} must be specified with an array of parameter types`
export const errNumCtorArgs = (numParams, numArgs) => `wrong number of arguments: expected ${numParams} but was ${numArgs}`
export const errBadCtorArg = (arg, argIndex, ctorName, errMsg) => `value ${showVal(arg)} cannot be passed as argument ${argIndex} of constructor ${ctorName}; ${errMsg}`
export const errWrongType = (expectedType) => `expected value of type ${showType(expectedType)}`
export const errInvalidCaseName = (caseName, validCases) => `${caseName} is not one of the valid constructors for this type (${validCases.join(', ')})`
export const errExhaustiveness = (missingCases) => `not all cases handled (missing ${missingCases.join(', ')})`
export const errMissingCase = (caseName) => `failed to handle case ${caseName}`
export const errMissingRecordFields = (missingKeys) => `missing record field${missingKeys.length === 1 ? '' : 's'} ${missingKeys.join(', ')}`
export const errExtraneousRecordFields = (extraKeys) => `extraneous record field${extraKeys.length === 1 ? '' : 's'} ${extraKeys.join(', ')}`
export const errBadRecordFieldValue = (val, key, errMsg) => `value ${showVal(val)} cannot be assigned to field ${key}; ${errMsg}`
export const errAttemptedFieldMutation = 'attempted to modify an immutable record'
export const errGetNonexistentRecordField = (key, validKeys) => `attempted to get ${key} from record { ${validKeys.join(', ')} }`
