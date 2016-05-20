import Settings from './settings'
import {
  checkType,

  errMissingRecordFields,
  errExtraneousRecordFields,
  errBadRecordFieldValue,
  errAttemptedFieldMutation
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
      throw new TypeError(errMissingRecordFields(missingKeys))

    const extraKeys = keyDiff(obj, spec)
    if (extraKeys.length > 0)
      throw new TypeError(errExtraneousRecordFields(extraKeys))

    for (const key in obj) {
      const val = obj[key]
      const type = spec[key]
      const errMsg = checkType(val, type)
      if (errMsg)
        throw new TypeError(errBadRecordFieldValue(val, key, errMsg))
    }

    return Object.freeze(obj)
  }
}
