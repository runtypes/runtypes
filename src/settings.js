const settings = {
  check: true,
  requireExhaustiveCases: true,
  disallowExtraneousCases: true
}

const accessor = key => value => {
  if (value === undefined)
    return settings[key]
  settings[key] = value
}

export const check = accessor('check')
export const requireExhaustiveCases = accessor('requireExhaustiveCases')
export const disallowExtraneousCases = accessor('disallowExtraneousCases')
