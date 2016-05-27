const settings = {
  check: true,
  requireExhaustiveCases: true,
  disallowExtraneousCases: true
}

// Generate accessors for each of the settings
for (const key in settings) {
  module.exports[key] = (value) => {
    if (value === undefined)
      return settings[key]
    settings[key] = value
  }
}

if (typeof Object.freeze !== 'undefined')
  Object.freeze(module.exports)
