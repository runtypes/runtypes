import { Runtype, Rt, Static, runtype, ValidationError } from './base'
import { hasKey } from '../util'

export interface Record<O extends { [_ in string]: Rt }> extends Runtype<{[K in keyof O]: Static<O[K]> }> {
  tag: 'record'
  Fields: O
}

/**
 * Construct a record runtype from runtypes for its values.
 */
export function Record<O extends { [_: string]: Rt }>(Fields: O) {
  return runtype<Record<O>>(x => {
    if (x === null || x === undefined)
      throw new ValidationError(`Expected a defined non-null value but was ${typeof x}`)

    // tslint:disable-next-line:forin
    for (const key in Fields) {
      if (hasKey(key, x))
        Fields[key].check(x[key])
      else
        throw new ValidationError(`Missing property ${key}`)
    }

    return x as O
  }, { tag: 'record', Fields })
}
