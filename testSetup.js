// Register babel so that it will transpile ES6 to ES5
// before our tests run.
require('babel-register')()

// Run ESLint
const { CLIEngine } = require('eslint')
const cli = new CLIEngine()
const { results } = cli.executeOnFiles(['src'])
const formatter = cli.getFormatter('stylish')
// Indent results to align with mocha output
const summary = formatter(results).replace(/\n/g, '\n  ')
console.log(summary)
if (CLIEngine.getErrorResults(results).length) {
  // Throw to short-circuit the test suite if we have linting errors
  const err = new Error()
  // Don't allow Mocha to print a useless stack trace
  err.stack = ''
  throw err
}
