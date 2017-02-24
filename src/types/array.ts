import { Runtype, Rt, Static, create } from '../runtype'
import { ValidationError } from '../validation-error'

interface Arr<E extends Rt> extends Runtype<Static<E>[]> {
  tag: 'array'
  element: E
}

/**
 * Construct an array runtype from a runtype for its elements.
 */
function Arr<E extends Rt>(element: E): Arr<E> {
  return create<Arr<E>>(xs => {
    if (!(xs instanceof Array))
      throw new ValidationError(`Expected array but was ${typeof xs}`)
    for (const x of xs)
      element.check(x)
    return xs
  }, { tag: 'array', element })
}

export { Arr as Array }
