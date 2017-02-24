import { Runtype, create, Rt } from '../runtype'
import { Record } from './record'
import { ValidationError } from '../validation-error'

export interface StringDictionary<V> extends Runtype<{ [_: string]: V }> {
  tag: 'dictionary'
  keyType: 'string'
}

export interface NumberDictionary<V> extends Runtype<{ [_: number]: V }> {
  tag: 'dictionary'
  keyType: 'number'
}

/**
 * Construct a runtype for arbitrary dictionaries.
 */
export function Dictionary<V>(v: Runtype<V>, keyType?: 'string'): StringDictionary<V>
export function Dictionary<V>(v: Runtype<V>, keyType?: 'number'): NumberDictionary<V>
export function Dictionary<V>(v: Runtype<V>, keyType = 'string') {
  return create<Rt>(x => {
    Record({}).check(x)

    if (typeof x !== 'object')
      throw new ValidationError(`Expected an object but was ${typeof x}`)

    if (Object.getPrototypeOf(x) !== Object.prototype) {
      if (!Array.isArray(x))
        throw new ValidationError(`Expected simple object but was complex`)
      else if (keyType === 'string')
        throw new ValidationError(`Expected dictionary but was array`)
    }

    for (const key in x) {
      // Object keys are always strings
      if (keyType === 'number') {
        if (isNaN(+key))
          throw new ValidationError(`Expected dictionary key to be a number but was string`)
      }
      v.check((x as any)[key])
    }

    return x
  }, { tag: 'dictionary', keyType })
}
