import {
  errNoNullOrUndefined,
  errWrongType
} from './errorMessages'

import {
  primByType,
  primByTypeOf
} from './primitives'

export const isType = (type) => {
  if (primByType.has(type))
    return true

  return false
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
