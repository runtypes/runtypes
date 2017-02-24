import { Runtype, Rt, Static, create } from './runtype'
import { Union } from '../index'
import { Undefined } from './literal'
import { hasKey } from '../util'
import { ValidationError } from '../validation-error'

export interface Optional<O extends {[_ in string]: Rt }> extends Runtype<{[K in keyof O]?: Static<O[K]> }> {
  tag: 'optional'
  Fields: O
}

/**
 * Construct a runtype for records of optional values.
 */
export function Optional<O extends { [_: string]: Rt }>(Fields: O) {
  return create<Optional<O>>(x => {
    if (x === null || x === undefined)
      throw new ValidationError(`Expected a defined non-null value but was ${typeof x}`)

    // tslint:disable-next-line:forin
    for (const key in Fields)
      if (hasKey(key, x))
        Union(Fields[key], Undefined).check(x[key])

    return x as Partial<O>
  }, { tag: 'optional', Fields })
}
