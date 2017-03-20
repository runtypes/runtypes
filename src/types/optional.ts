import { Runtype, Rt, Static, create, validationError } from '../runtype'
import { Union } from '../index'
import { Undefined } from './literal'
import { hasKey } from '../util'

export interface Optional<O extends {[_ in string]: Rt }> extends Runtype<{[K in keyof O]?: Static<O[K]> }> {
  tag: 'optional'
  fields: O
}

/**
 * Construct a runtype for records of optional values.
 */
export function Optional<O extends { [_: string]: Rt }>(fields: O) {
  return create<Optional<O>>(x => {
    if (x === null || x === undefined)
      throw validationError(`Expected a defined non-null value but was ${typeof x}`)

    // tslint:disable-next-line:forin
    for (const key in fields)
      if (hasKey(key, x))
        Union(fields[key], Undefined).check(x[key])

    return x as Partial<O>
  }, { tag: 'optional', fields })
}
