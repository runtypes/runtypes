import { Runtype, Rt, Static, create, ValidationError } from './base'

interface Arr<E extends Rt> extends Runtype<Static<E>[]> {
  tag: 'array'
  Element: E
}

/**
 * Construct an array runtype from a runtype for its elements.
 */
function Arr<E extends Rt>(Element: E): Arr<E> {
  return create<Arr<E>>(xs => {
    if (!(xs instanceof Array))
      throw new ValidationError(`Expected array but was ${typeof xs}`)
    for (const x of xs)
      Element.check(x)
    return xs
  }, { tag: 'array', Element })
}

export { Arr as Array }
