import { Runtype, Rt, Static, create, validationError } from '../runtype'

interface Arr<E extends Rt> extends Runtype<Static<E>[]> {
  tag: 'array'
  element: E
}

/**
 * Construct an array runtype from a runtype for its elements.
 */
function Arr<E extends Rt>(element: E): Arr<E> {
  return create<Arr<E>>(xs => {
    if (!Array.isArray(xs))
      throw validationError(`Expected array but was ${typeof xs}`)
    for (const x of xs)
      element.check(x)
    return xs
  }, { tag: 'array', element })
}

export { Arr as Array }
