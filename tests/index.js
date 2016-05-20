// Convert a string to a regexp, escaping all special characters inside it
const re = str => new RegExp(str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"))

// Type inference
assert(typesEqual(Number, inferType(99)))
assert(typesEqual(String, inferType('hello')))
assert(typesEqual(Boolean, inferType(true)))

const Maybe = T => Enum({
    Nothing: [],
    Just: [T]
})

const maybe = Maybe(Number).Just(3)
assert.equal(4, maybe({
    Just(n) { return n + 1 },
    Nothing() { return 'oops' }
}))

assert.throws(() => {
    Maybe(Number).Just(null)
}, re(errNoNullOrUndefined))

assert.throws(() => {
    Maybe(Number).Just(undefined)
}, re(errNoNullOrUndefined))

assert.throws(() => {
    Maybe(Number).Just()
}, re(errNumCtorArgs(1, 0)))

assert.throws(() => {
    Maybe(Number).Just(1, 'foo')
}, re(errNumCtorArgs(1, 2)))

assert.throws(() => {
    Maybe(Number).Just('foo')
}, re(errBadCtorArg('foo', 0, 'Just', errWrongType(Number))))

assert.throws(() => {
    const just9 = Maybe(Number).Just(9)
    just9({
        Nothing() {
            return 4
        },
        Just(x) {
            return x + 9
        },
        Bogus(y) {
            return 3
        }
    })
}, re(errInvalidCaseName('Bogus', ['Nothing', 'Just'])))

assert.throws(() => {
    const just9 = Maybe(Number).Nothing()
    just9({
        Nothing() {
            return 4
        }
    })
}, re(errExhaustiveness(['Just'])))

// Turn off exhaustiveness checking for this test
settings.checkExhaustive = false
assert.throws(() => {
    const just9 = Maybe(Number).Just(9)
    just9({
        Nothing() {
            return 4
        }
    })
}, re(errMissingCase('Just')))
settings.checkExhaustive = true
