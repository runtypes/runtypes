import { primByType } from './primitives'

export const showType = (type) => {
  const prim = primByType.get(type)
  if (prim)
    return prim.name
  throw new Error(`unable to show type ${type}`)
}

export const showVal = (val) => {
  return JSON.stringify(val)
}
