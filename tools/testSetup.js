// Register babel so that it will transpile ES6 to ES5
// before our tests run.
require('babel-register')()

// Run ESLint
const { CLIEngine } = require('eslint')
const cli = new CLIEngine()
const { results } = cli.executeOnFiles(['src'])
const formatter = cli.getFormatter('stylish')
console.log(formatter(results).replace(/\n/g, '\n  '))
if (CLIEngine.getErrorResults(results).length) {
  console.error('  Skipping tests due to lint errors')
  const err = new Error()
  err.stack = ''
  throw err
}
