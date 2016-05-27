import {
  errNoNullOrUndefined,
  errWrongType
} from './errorMessages'

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
