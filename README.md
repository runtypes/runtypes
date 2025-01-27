<div align="center"><br><br>

# Runtypes

[![License](https://img.shields.io/github/license/runtypes/runtypes?color=%231e2327)](LICENSE) [![JSR](https://jsr.io/badges/@runtypes/runtypes)](https://jsr.io/@runtypes/runtypes) [![NPM Version](https://img.shields.io/npm/v/runtypes)](https://www.npmjs.com/package/runtypes) [![Coverage Status](https://coveralls.io/repos/github/runtypes/runtypes/badge.svg?branch=master)](https://coveralls.io/github/runtypes/runtypes?branch=master)

Safely bring untyped data into the fold.

<br><br></div>

Runtypes allow you to take values about which you have no assurances and check that they conform to some type `A`. This is done by means of composable type validators of primitives, literals, arrays, tuples, objects, unions, intersections and more.

## Example

Suppose you have objects which represent asteroids, planets, ships and crew members. In TypeScript, you might write their types like so:

```ts
type Vector = [number, number, number]

type Asteroid = {
	type: "asteroid"
	location: Vector
	mass: number
}

type Planet = {
	type: "planet"
	location: Vector
	mass: number
	population: number
	habitable: boolean
}

type Rank = "captain" | "first mate" | "officer" | "ensign"

type CrewMember = {
	name: string
	age: number
	rank: Rank
	home: Planet
}

type Ship = {
	type: "ship"
	location: Vector
	mass: number
	name: string
	crew: CrewMember[]
}

type SpaceObject = Asteroid | Planet | Ship
```

If the objects which are supposed to have these shapes are loaded from some external source, perhaps a JSON file, we need to validate that the objects conform to their specifications. We do so by building corresponding `Runtype`s in a very straightforward manner:

```ts
import { Boolean, Number, String, Literal, Array, Tuple, Object, Union } from "runtypes"

const Vector = Tuple(Number, Number, Number)

const Asteroid = Object({
	type: Literal("asteroid"),
	location: Vector,
	mass: Number,
})

const Planet = Object({
	type: Literal("planet"),
	location: Vector,
	mass: Number,
	population: Number,
	habitable: Boolean,
})

const Rank = Union(Literal("captain"), Literal("first mate"), Literal("officer"), Literal("ensign"))

const CrewMember = Object({
	name: String,
	age: Number,
	rank: Rank,
	home: Planet,
})

const Ship = Object({
	type: Literal("ship"),
	location: Vector,
	mass: Number,
	name: String,
	crew: Array(CrewMember),
})

const SpaceObject = Union(Asteroid, Planet, Ship)
```

(See the [examples](examples) directory for an expanded version of this.)

Now if we are given a putative `SpaceObject` we can validate it like so:

```ts
// spaceObject: SpaceObject
const spaceObject = SpaceObject.check(value)
```

If the object doesn't conform to the type specification, `check` will throw an exception.

## Error information

When it fails to validate, your runtype emits a `ValidationError` object that contains detailed information that describes what's the problem. Following properties are available in the object:

- `name`: Always `"ValidationError"`
- `message`: A `string` that summarizes the problem overall
- `failure`: A [`Failure`](src/result/Failure.ts) that describes the problem in a structured way

If you want to inspect why the validation failed, look into the `failure` object:

- `code`: A [`Failcode`](src/result/Failcode.ts) that roughly categorizes the problem
- `message`: A `string` that summarizes the problem overall
- `expected`: The runtype that yielded this failure
- `received`: The value that caused this failure
- `details`: An object that describes which property was invalid precisely. Only available for complex runtypes (e.g. `Object`, `Array`, and the like; `Union` and `Intersect` also emit this enumerating a failure for each member)
- `detail`: An object that describes the failure of the inner runtype. Only available for `Brand` and contextual failures (e.g. failures in `Record` keys, in boundaries of `Contract`/`AsyncContract`, etc.)
- `thrown`: A thrown value, which is typically an error message, if any. Only available for runtypes that involve user-provided validation functions (e.g. `Constraint`, `Parser`, and `InstanceOf`) or constraint-like failures like about the length of `Tuple`

What shapes of failures there might actually be is documented on the JSDoc comment of each runtype.

If you want to inform your users about the validation error, it's strongly discouraged to rely on the format of the `message` property, as it may change across minor versions for readability thoughts. Instead of parsing `message`, you should use other properties to handle further tasks such as i18n.

## Static type inference

The inferred type of `Asteroid` in the above example is a subtype of

```ts
Runtype<{
	type: "asteroid"
	location: [number, number, number]
	mass: number
}>
```

That is, it's a `Runtype<Asteroid>`, and you could annotate it as such. But we don't really have to define the `Asteroid` type at all now, because the inferred type is correct. Defining each of your types twice, once at the type level and then again at the value level, is a pain and not very [DRY](https://en.wikipedia.org/wiki/Don't_repeat_yourself). Fortunately you can define a static `Asteroid` type which is an alias to the `Runtype`-derived type like so:

```ts
type Asteroid = Static<typeof Asteroid>
```

which achieves the same result as

```ts
type Asteroid = {
	type: "asteroid"
	location: [number, number, number]
	mass: number
}
```

## Conforming to predefined static type

Instead of getting it to be inferred, you should be able to create a runtype that corresponds to a static type predefined somewhere. In such case you can statically ensure that your runtype conforms to the specification, by using `.conform<T>()`:

```typescript
type Specification = {
	foo: string
	bar?: string
}
const Correct = Object({
	foo: String,
	bar: String.optional(),
}).conform<Specification>()
// @ts-expect-error: should fail
const Wrong = Object({
	foo: String,
	bar: String,
}).conform<Specification>()
```

The error message on the wrong definition might be verbose like below, but you'll eventually find it contains where is the wrong piece if you scroll down the wall of text.

```plaintext
The 'this' context of type 'Object<{ foo: String; bar: String; }>' is not assignable to method's 'this' of type 'Conform<Specification>'.
	Type 'Object<{ foo: String; bar: String; }>' is not assignable to type 'Conformance<Specification>'.
		Types of property '[RuntypeConformance]' are incompatible.
			Type '(StaticTypeOfThis: { foo: string; bar: string; }) => { foo: string; bar: string; }' is not assignable to type '(StaticTypeOfThis: Specification) => Specification'.
				Types of parameters 'StaticTypeOfThis' and 'StaticTypeOfThis' are incompatible.
					Type 'Specification' is not assignable to type '{ foo: string; bar: string; }'.
						Property 'bar' is optional in type 'Specification' but required in type '{ foo: string; bar: string; }'.
```

## Guard function

Runtypes provide a guard function as the `guard` method:

```ts
const disembark = (value: unknown) => {
	if (SpaceObject.guard(value)) {
		// value: SpaceObject
		if (value.type === "ship") {
			// value: Ship
			value.crew = []
		}
	}
}
```

## Assertion function

Runtypes provide an assertion function as the `assert` method:

```ts
const disembark = (value: unknown) => {
	try {
		SpaceObject.assert(value)
		// value: SpaceObject
		if (value.type === "ship") {
			// value: Ship
			value.crew = []
		}
	} catch (error) {}
}
```

This might be uncomfortable that TypeScript requires you to manually write the type annotation for your runtype.

## Constraint checking

Beyond mere type checking, we can add arbitrary runtime constraints to a `Runtype`:

```ts
const PositiveNumber = Number.withConstraint(n => n > 0)
PositiveNumber.check(-3) // Throws error: Failed constraint check
```

You can provide more descriptive error messages for failed constraints by returning a string instead of `false`:

```ts
const PositiveNumber = Number.withConstraint(n => n > 0 || `${n} is not positive`)
PositiveNumber.check(-3) // Throws error: -3 is not positive
```

### Narrowing the static type

Constraint checking narrows down the original type to a subtype of it. This should be reflected on the static type. You can pass the desired type as the type argument:

```typescript
const TheAnswer = Literal(42)
const WithConstraint = Number.withConstraint<42>(TheAnswer.guard)
type WithConstraint = Static<typeof WithConstraint> // 42
```

Alternatively, you can directly wire up the TypeScript's own facility to narrow down types: guard functions and assertion functions. There're corresponding methods on a runtype, so choose the most concise one:

```typescript
const WithGuard = Number.withGuard(TheAnswer.guard)
type WithGuard = Static<typeof WithGuard> // 42
const WithAssertion = Number.withAssertion(TheAnswer.assert)
type WithAssertion = Static<typeof WithAssertion> // 42
```

If you want to provide custom error messages while narrowing static types, you can throw `string` or `Error` from a constraint, guard, or assertion function. Actually, returning a string from a function passed to `withConstraint` is supported by this exception handling internally.

Too often there might be cases you can't express desired types exactly in TypeScript, such as the type for positive numbers. In such cases you should at least express them as branded types.

```typescript
const PositiveNumber = Number.withConstraint(n => n > 0).withBrand("PositiveNumber")
```

`withBrand` modifier is also useful when you want to give your runtype a custom name, which will be used in error messages.

## Template literals

The `Template` runtype validates that a value is a string that conforms to the template.

You can use the familiar syntax to create a `Template` runtype:

```ts
const T = Template`foo${Literal("bar")}baz`
```

But then the type inference won't work:

```ts
type T = Static<typeof T> // string
```

Because TS doesn't provide the exact string literal type information (`["foo", "baz"]` in this case) to the underlying function. See the issue [microsoft/TypeScript#33304](https://github.com/microsoft/TypeScript/issues/33304), especially this comment [microsoft/TypeScript#33304 (comment)](https://github.com/microsoft/TypeScript/issues/33304#issuecomment-697977783) we hope to be implemented.

If you want the type inference rather than the tagged syntax, you have to manually write a function call:

```ts
const T = Template(["foo", "baz"] as const, Literal("bar"))
type T = Static<typeof T> // "foobarbaz"
```

As a convenient solution for this, it also supports another style of passing arguments:

```ts
const T = Template("foo", Literal("bar"), "baz")
type T = Static<typeof T> // "foobarbaz"
```

You can pass various things to the `Template` constructor, as long as they are assignable to `string | number | bigint | boolean | null | undefined` and the corresponding `Runtype`s:

```ts
// Equivalent runtypes
Template(Literal("42"))
Template(42)
Template(Template("42"))
Template(4, "2")
Template(Literal(4), "2")
Template(String.withConstraint(s => s === "42"))
Template(
	Intersect(
		Number.withConstraint(n => n === 42),
		String.withConstraint(s => s.length === 2),
		// `Number`s in `Template` accept alternative representations like `"0x2A"`,
		// thus we have to constraint the length of string, to accept only `"42"`
	),
)
```

Trivial items such as bare literals, `Literal`s, and single-element `Union`s and `Intersect`s are all coerced into strings at the creation time of the runtype. Additionally, `Union`s of such runtypes are converted into `RegExp` patterns like `(?:foo|bar|...)`, so we can assume `Union` of `Literal`s is a fully supported runtype in `Template`.

### Caveats

A `Template` internally constructs a `RegExp` to parse strings. This can lead to a problem if it contains multiple non-literal runtypes:

```ts
const UpperCaseString = String.withConstraint(s => s === s.toUpperCase(), {
	name: "UpperCaseString",
})
const LowerCaseString = String.withConstraint(s => s === s.toLowerCase(), {
	name: "LowerCaseString",
})
Template(UpperCaseString, LowerCaseString) // DON'T DO THIS!
```

The only thing we can do for parsing such strings correctly is brute-forcing every single possible combination until it fulfills all the constraints, which must be hardly done. Actually `Template` treats `String` runtypes as the simplest `RegExp` pattern `.*` and the “greedy” strategy is always used, that is, the above runtype won't work expectedly because the entire pattern is just `^(.*)(.*)$` and the first `.*` always wins. You have to avoid using `Constraint` this way, and instead manually parse it using a single `Constraint` which covers the entire string.

## Variadic tuples

You can spread a `Tuple` or an `Array` within arguments of `Tuple`.

```typescript
const T = Tuple(Literal(0), ...Tuple(Literal(1), Literal(2)), Literal(3))
type T = Static<typeof T> // [0, 1, 2, 3]

const U = Tuple(Literal(0), ...Array(Literal(1)), Literal(2))
type U = Static<typeof U> // [0, ...1[], 2]
```

Component runtypes are expectedly inferred like this:

```typescript
const T = Tuple(Literal(0), ...Tuple(Literal(1), Literal(2)), Literal(3))
const literal0: Literal<0> = T.components[0]
const literal1: Literal<1> = T.components[1]
const literal2: Literal<2> = T.components[2]
const literal3: Literal<3> = T.components[3]
```

Nested spreading is also supported:

```typescript
const T = Tuple(Literal(0), ...Tuple(Literal(1), ...Array(Literal(2)), Literal(3)), Literal(4))
const leading0: Literal<0> = T.components.leading[0]
const leading1: Literal<1> = T.components.leading[1]
const rest: Array<Literal<2>> = T.components.rest
const trailing0: Literal<3> = T.components.trailing[0]
const trailing1: Literal<4> = T.components.trailing[1]
```

## `instanceof` wrapper

If you have access to the class that you want to test values with the `instanceof` operator, then the `InstanceOf` runtype is exactly what you're looking for. Usage is straightforward:

```ts
class ObjectId { ... };
const ObjectIdChecker = InstanceOf(ObjectId);
ObjectIdChecker.check(value);
```

## Branded types

Branded types is a way to emphasize the uniqueness of a type. This is useful [until we have nominal types](https://github.com/microsoft/TypeScript/pull/33038):

```ts
const Username = String.withBrand("Username")
const Password = String.withBrand("Password").withConstraint(
	str => str.length >= 8 || "Too short password",
)

const signIn = Contract({
	receives: Tuple(Username, Password),
	returns: Unknown,
}).enforce((username, password) => {
	/*...*/
})

const username = Username.check("someone@example.com")
const password = Password.check("12345678")

// Static type OK, runtime OK
signIn(username, password)

// Static type ERROR, runtime OK
signIn(password, username)

// Static type ERROR, runtime OK
signIn("someone@example.com", "12345678")
```

## Optional properties

`Object` runtypes should be able to express optional properties. There's a modifier to do that: `.optional()`.

```ts
Object({ x: Number.optional() })
```

You must be aware of the difference between `Object({ x: Union(String, Undefined) })` and `Object({ x: String.optional() })`; the former means “_**`x` must be present**, and must be `string` or `undefined`_”, while the latter means “_**`x` can be present or absent**, but must be `string` if present_”.

It's strongly discouraged to disable [`"exactOptionalPropertyTypes"`](https://www.typescriptlang.org/tsconfig/#exactOptionalPropertyTypes) in the tsconfig; if you do so, the correspondence between runtypes and the inferred static types get lost. We can't respect tsconfig at runtime, so `runtypes` always conform the behavior `"exactOptionalPropertyTypes": true`, in favor of the expressiveness.

## Exact object validation

`Object` has a modifier to perform exact object validation: `.exact()`.

```typescript
const O = Object({ x: Number }).exact()
O.guard({ x: 42 }) // true
O.guard({ x: 42, y: 24 }) // false
```

Note that [TypeScript doesn't have exact types](https://github.com/microsoft/TypeScript/issues/12936) at the moment, so it's recommended to wrap your exact `Object` runtype within a `Brand` to at least prevent the unexpected behavior of the inferred static type:

```typescript
const x0 = { x: 42 }
const x1 = { x: 42, y: 24 }

const O = Object({ x: Number }).exact()
type O = Static<typeof O>
const o0: O = x0
const o1: O = x1 // You would not want this to be possible.
globalThis.Object.hasOwn(o1, "y") === true

const P = O.withBrand("P")
type P = Static<typeof P>
const p0: P = P.check(x0) // Branded types require explicit assertion.
const p1: P = P.check(x1) // So this won't accidentally pass at runtime.
```

You should beware that `Object` validation only respects **enumerable own** keys; thus if you want to completely eliminate extra properties that may be non-enumerable or inherited, use `parse` method.

## Parsing after validation

Every runtype has the `withParser` and `parse` methods that offer the functionality to transform validated values automatically.

```typescript
const O = Object({ x: String.withParser(parseInt).default(42) })
type OStatic = Static<typeof O> // { x: string }
type OParsed = Parsed<typeof O> // { x: number }
O.parse({ x: "42" }).x === 42
```

The `.default(...)` modifier works the same as `.optional()` for mere validation, but for parsing, it works as falling back to the value if the property was absent.

```typescript
O.parse({}).x === 42
```

Extraneous properties are not copied to the resulting value.

```typescript
"y" in O.parse({ y: "extra" }) === false
```

While `parse` returns a new value, traditional validation methods such as `check` don't change their semantics even with parsers.

```typescript
const o: OStatic = { x: "42" }
o === O.check(o)
```

### Semantics in complex runtypes

In an `Object`, an `Array`, and a `Tuple`, `Parser`s will work just as you'd expect.

In a `Template`, parsing can work like this:

```typescript
const TrueToFalse = Literal("true").withParser(() => "false" as const)
const Value = Template("value: ", TrueToFalse)
Value.parse("value: true") === "value: false"
```

In a `Union`, the first succeeding runtype returns a value and further alternatives are not executed at all:

```typescript
const Flip = Union(
	Boolean.withParser(b => !b),
	Boolean.withParser(b => !!b),
)
Flip.parse(true) === false
```

In an `Intersect`, the last runtype returns a value and preceding intersectees are executed but results are just discarded:

```typescript
const FlipFlip = Intersect(
	Boolean.withParser(b => !b),
	Boolean.withParser(b => !!b),
)
FlipFlip.parse(true) === true
```

Where the members are `Object`s, this behavior doesn't match with TypeScript; this is to avoid [unsound type inference](https://github.com/runtypes/runtypes/pull/443).

```typescript
const A = Object({ n: String.withParser(() => 1 as const) })
const B = Object({ n: String.withParser(parseInt) })
const AB = A.and(B)
type A = Parsed<typeof A>
type B = Parsed<typeof B>
type AB0 = A & B // { n: 1 } & { n: number }
type AB1 = Parsed<typeof AB> // { n: number }
```

## Readonly objects and arrays

`Array` and `Object` runtypes have a special function `.asReadonly()`, that returns the same runtype but the static counterpart is readonly.

For example:

```typescript
const Asteroid = Object({
	type: Literal("asteroid"),
	location: Vector,
	mass: Number,
}).asReadonly()
type Asteroid = Static<typeof Asteroid>
// { readonly type: 'asteroid', readonly location: Vector, readonly mass: number }

const AsteroidArray = Array(Asteroid).asReadonly()
type AsteroidArray = Static<typeof AsteroidArray>
// readonly Asteroid[]
```

## Helper functions for `Object`

`Object` runtype has the methods `.pick()` and `.omit()`, which will return a new `Object` with or without specified fields (see [Example](#example) section for detailed definition of `Rank` and `Planet`):

```ts
const CrewMember = Object({
	name: String,
	age: Number,
	rank: Rank,
	home: Planet,
})

const Visitor = CrewMember.pick("name", "home")
type Visitor = Static<typeof Visitor> // { name: string; home: Planet; }

const Background = CrewMember.omit("name")
type Background = Static<typeof Background> // { age: number; rank: Rank; home: Planet; }
```

Also you can use `.extend()` to get a new `Object` with extended fields:

```ts
const PetMember = CrewMember.extend({
	species: String,
})
type PetMember = Static<typeof PetMember>
// { name: string; age: number; rank: Rank; home: Planet; species: string; }
```

It is capable of reporting compile-time errors if any field is not assignable to the base runtype. You can suppress this error by using `@ts-ignore` directive or `.omit()` before, and then you'll get an incompatible version from the base `Object`.

```ts
const WrongMember = CrewMember.extend({
	rank: Literal("wrong"),
	// Type '"wrong"' is not assignable to type '"captain" | "first mate" | "officer" | "ensign"'.
})
```

## Pattern matching

The `Union` runtype offers the ability to do type-safe, exhaustive case analysis across its variants using the `match` method:

```ts
const isHabitable = SpaceObject.match(
	asteroid => false,
	planet => planet.habitable,
	ship => true,
)

if (isHabitable(spaceObject)) {
	// ...
}
```

There's also a top-level `match` function which allows testing an ad-hoc sequence of runtypes. You should use it along with `when` helper function to enable type inference of the parameters of the case functions:

```ts
const makeANumber = match(
	when(Number, n => n * 3),
	when(Boolean, b => (b ? 1 : 0)),
	when(String, s => s.length),
)

makeANumber(9) // = 27
```

To allow the function to be applied to anything and then handle match failures, simply use an `Unknown` case at the end:

```ts
const makeANumber = match(
	when(Number, n => n * 3),
	when(Boolean, b => (b ? 1 : 0)),
	when(String, s => s.length),
	when(Unknown, () => 42),
)
```

## Adding additional properties

You may want to provide additional properties along with your runtype, such as the default value and utility functions. This can be easily achieved by the `with` method.

```typescript
const Seconds = Number.withBrand("Seconds").with({
	toMilliseconds: (seconds: Seconds) => (seconds * 1000) as Milliseconds,
})
type Seconds = Static<typeof Seconds>

const Milliseconds = Number.withBrand("Milliseconds").with({
	toSeconds: (milliseconds: Milliseconds) => (milliseconds / 1000) as Seconds,
})
type Milliseconds = Static<typeof Milliseconds>
```

Sometimes defining additional properties requires access to the original runtype itself statically or dynamically:

```typescript
// Bummer, this won't work because of the circular reference.
const pH = Number.withBrand("pH").with({ default: 7 as pH })
type pH = Static<typeof pH>
```

In such cases, you have to receive the original runtype by passing a function instead:

```typescript
const pH = Number.withBrand("pH").with(self => ({
	default: 7 as Static<typeof self>,
}))
type pH = Static<typeof pH>
```

## Function contracts

Runtypes along with constraint checking are a natural fit for enforcing function contracts. You can construct a contract from runtypes for the parameters and return type of the function:

```ts
const divide = Contract({
	// This must be a runtype for arrays, just like annotating a rest parameter in TS.
	receives: Tuple(
		Number,
		Number.withConstraint(n => n !== 0 || "division by zero"),
	),
	returns: Number,
}).enforce((n, m) => n / m)

divide(10, 2) // 5

divide(10, 0) // Throws error: division by zero
```

Contracts can work with `Parser` runtypes:

```typescript
const ParseInt = String.withParser(parseInt)
const contractedFunction = Contract({
	receives: Array(ParseInt),
	returns: Array(ParseInt),
}).enforce((...args) => args.map(globalThis.String))
contractedFunction("42", "24") // [42, 24]
```

## Miscellaneous tips

### Annotating runtypes

There might be cases that you have to annotate the type of a runtype itself, not of the checked or parsed value. Basically you should use `Runtype.Core` for it to reduce the type inference cost. `Runtype.Core` is a slim version of `Runtype`; it omits the utility methods that are only used to define a runtype from it.

On the boundaries of a function, the “accept broader, return narrower” principle applies to runtypes of course; it's **_necessary to use `Runtype.Core` in the parameter types_**, and it's better to use `Runtype` in the return type.

When you're to introspect the contents of a variable `x` typed as `Runtype.Core`, you'd want to narrow it to `Runtype.Interfaces` first by `Runtype.isRuntype(x)`.

## Related libraries

- [generate-runtypes](https://github.com/simenandre/generate-runtypes#readme) Generates runtypes from structured data. Useful for code generators
- [json-to-runtypes](https://github.com/runeh/json-to-runtypes#readme) Generates runtypes by parsing example JSON data
- [rest.ts](https://github.com/hmil/rest.ts) Allows building type safe and runtime-checked APIs
- [runtypes-generate](https://github.com/typeetfunc/runtypes-generate) Generates random data by `Runtype` for property-based testing
- [runtyping](https://github.com/johngeorgewright/runtyping) Generate runtypes from static types & JSON schema
- [schemart](https://github.com/codemariner/schemart) Generate runtypes from your database schema.