import { Runtype, Rt, Static, create, validationError } from '../runtype'
import { Union } from '../index'
import { Undefined } from './literal'
import { hasKey } from '../util'

export interface Part<O extends {[_ in string]: Rt }> extends Runtype<{[K in keyof O]?: Static<O[K]> }> {
  tag: 'partial'
  fields: O
}

/**
 * Construct a runtype for partial records
 */
export function Part<O extends { [_: string]: Rt }>(fields: O) {
  return create<Part<O>>(x => {
    if (x === null || x === undefined)
      throw validationError(`Expected a defined non-null value but was ${typeof x}`)

    // tslint:disable-next-line:forin
    for (const key in fields)
      if (hasKey(key, x)) {
        try {
          Union(fields[key], Undefined).check(x[key])
        } catch ({ message }) {
          throw validationError(`In key ${key}: ${message}`)
        }
      }

    return x as Partial<O>
  }, { tag: 'partial', fields })
}

export { Part as Partial }
