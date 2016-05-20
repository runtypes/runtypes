import Settings from './settings'
import {
  errMissingRecordKeys,
  errExtraneousRecordKeys
} from './util'

const keyDiff = (obj1, obj2) => {
  const uniqueTo1 = []
  for (const key in obj1) {
    if (!(key in obj2))
      uniqueTo1.push(key)
  }
  return uniqueTo1.reverse()
}

export default (spec) => {
  return (obj) => {
    const missingKeys = keyDiff(spec, obj)
    if (missingKeys.length > 0)
      throw new TypeError(errMissingRecordKeys(missingKeys))

    const extraKeys = keyDiff(obj, spec)
    if (extraKeys.length > 0)
      throw new TypeError(errExtraneousRecordKeys(extraKeys))

    return obj
  }
}
