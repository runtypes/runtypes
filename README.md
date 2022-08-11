# Runtypes [![Build Status](https://travis-ci.org/pelotom/runtypes.svg?branch=master)](https://travis-ci.org/pelotom/runtypes) [![Coverage Status](https://coveralls.io/repos/github/pelotom/runtypes/badge.svg?branch=master)](https://coveralls.io/github/pelotom/runtypes?branch=master)

### Safely bring untyped data into the fold

Runtypes allow you to take values about which you have no assurances and check that they conform to some type `A`.
This is done by means of composable type validators of primitives, literals, arrays, tuples, records, unions,
intersections and more.

## Installation

```
npm install --save runtypes
```

## Example

Suppose you have objects which represent asteroids, planets, ships and crew members. In TypeScript, you might write their types like so:

```ts
type Vector = [number, number, number];

type Asteroid = {
  type: 'asteroid';
  location: Vector;
  mass: number;
};

type Planet = {
  type: 'planet';
  location: Vector;
  mass: number;
  population: number;
  habitable: boolean;
};

type Rank = 'captain' | 'first mate' | 'officer' | 'ensign';

type CrewMember = {
  name: string;
  age: number;
  rank: Rank;
  home: Planet;
};

type Ship = {
  type: 'ship';
  location: Vector;
  mass: number;
  name: string;
  crew: CrewMember[];
};

type SpaceObject = Asteroid | Planet | Ship;
```

If the objects which are supposed to have these shapes are loaded from some external source, perhaps a JSON file, we need to
validate that the objects conform to their specifications. We do so by building corresponding `Runtype`s in a very straightforward
manner:

```ts
import { Boolean, Number, String, Literal, Array, Tuple, Record, Union } from 'runtypes';

const Vector = Tuple(Number, Number, Number);

const Asteroid = Record({
  type: Literal('asteroid'),
  location: Vector,
  mass: Number,
});

const Planet = Record({
  type: Literal('planet'),
  location: Vector,
  mass: Number,
  population: Number,
  habitable: Boolean,
});

const Rank = Union(
  Literal('captain'),
  Literal('first mate'),
  Literal('officer'),
  Literal('ensign'),
);

const CrewMember = Record({
  name: String,
  age: Number,
  rank: Rank,
  home: Planet,
});

const Ship = Record({
  type: Literal('ship'),
  location: Vector,
  mass: Number,
  name: String,
  crew: Array(CrewMember),
});

const SpaceObject = Union(Asteroid, Planet, Ship);
```

(See the [examples](examples) directory for an expanded version of this.)

Now if we are given a putative `SpaceObject` we can validate it like so:

```ts
// spaceObject: SpaceObject
const spaceObject = SpaceObject.check(obj);
```

If the object doesn't conform to the type specification, `check` will throw an exception.

## Error information

When it fails to validate, your runtype emits a `ValidationError` object that contains detailed information that describes what's the problem. Following properties are available in the object:

- `name`: Always `"ValidationError"`
- `message`: A `string` that summarizes the problem overall
- `code`: A [`Failcode`](https://github.com/pelotom/runtypes/blob/dcd4fe0d0bd0fc9c3ec445bda30586f3e6acc71c/src/result.ts#L12-L33) that categorizes the problem
- `details`: An object that describes which property was invalid precisely; only for complex runtypes (e.g. `Record`, `Array`, and the like)

If you want to inform your users about the validation error, it's strongly discouraged to rely on the format of `message` property in your code, as it may change across minor versions for readability thoughts. Instead of parsing `message`, you should use `code` and/or `details` property to programmatically inspect the validation error, and handle other stuff such as i18n.

## Static type inference

In TypeScript, the inferred type of `Asteroid` in the above example is

```ts
Runtype<{
  type: 'asteroid'
  location: [number, number, number]
  mass: number
}>
```

That is, it's a `Runtype<Asteroid>`, and you could annotate it as such. But we don't really have to define the
`Asteroid` type in TypeScript at all now, because the inferred type is correct. Defining each of your types
twice, once at the type level and then again at the value level, is a pain and not very [DRY](https://en.wikipedia.org/wiki/Don't_repeat_yourself).
Fortunately you can define a static `Asteroid` type which is an alias to the `Runtype`-derived type like so:

```ts
import { Static } from 'runtypes';

type Asteroid = Static<typeof Asteroid>;
```

which achieves the same result as

```ts
type Asteroid = {
  type: 'asteroid';
  location: [number, number, number];
  mass: number;
};
```

## Type guards

In addition to providing a `check` method, runtypes can be used as [type guards](https://basarat.gitbook.io/typescript/type-system/typeguard):

```ts
function disembark(obj: {}) {
  if (SpaceObject.guard(obj)) {
    // obj: SpaceObject
    if (obj.type === 'ship') {
      // obj: Ship
      obj.crew = [];
    }
  }
}
```

## Pattern matching

The `Union` runtype offers the ability to do type-safe, exhaustive case analysis across its variants using the `match` method:

```ts
const isHabitable = SpaceObject.match(
  asteroid => false,
  planet => planet.habitable,
  ship => true,
);

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
);

makeANumber(9); // = 27
```

To allow the function to be applied to anything and then handle match failures, simply use an `Unknown` case at the end:

```ts
const makeANumber = match(
  when(Number, n => n * 3),
  when(Boolean, b => (b ? 1 : 0)),
  when(String, s => s.length),
  when(Unknown, () => 42),
);
```

## Constraint checking

Beyond mere type checking, we can add arbitrary runtime constraints to a `Runtype`:

```ts
const Positive = Number.withConstraint(n => n > 0);

Positive.check(-3); // Throws error: Failed constraint check
```

You can provide more descriptive error messages for failed constraints by returning
a string instead of `false`:

```ts
const Positive = Number.withConstraint(n => n > 0 || `${n} is not positive`);

Positive.check(-3); // Throws error: -3 is not positive
```

You can set a custom name for your runtype, which will be used in default error
messages and reflection, by using the `name` prop on the optional `options`
parameter:

```typescript
const C = Number.withConstraint(n => n > 0, { name: 'PositiveNumber' });
```

To change the type, there are two ways to do it: passing a type guard function
to a new `Runtype.withGuard()` method, or using the familiar
`Runtype.withConstraint()` method. (Both methods also accept an `options`
parameter to optionally set the name.)

Using a type guard function is the easiest option to change the static type,
because TS will infer the desired type from the return type of the guard
function.

```typescript
// use Buffer.isBuffer, which is typed as: isBuffer(obj: any): obj is Buffer;
const B = Unknown.withGuard(Buffer.isBuffer);
type T = Static<typeof B>; // T is Buffer
```

However, if you want to return a custom error message from your constraint
function, you can't do this with a type guard because these functions can only
return boolean values. Instead, you can roll your own constraint function and
use the `withConstraint<T>()` method. Remember to specify the type parameter for
the `Constraint` because it can't be inferred from your check function!

```typescript
const check = (o: any) => Buffer.isBuffer(o) || 'Dude, not a Buffer!';
const B = Unknown.withConstraint<Buffer>(check);
type T = Static<typeof B>; // T will have type of `Buffer`
```

One important choice when changing `Constraint` static types is choosing the
correct underlying type. The implementation of `Constraint` will validate the
underlying type _before_ running your constraint function. So it's important to
use a lowest-common-denominator type that will pass validation for all expected
inputs of your constraint function or type guard. If there's no obvious
lowest-common-denominator type, you can always use `Unknown` as the underlying
type, as shown in the `Buffer` examples above.

Speaking of base types, if you're using a type guard function and your base type
is `Unknown`, then there's a convenience runtype `Guard` available, which is a
shorthand for `Unknown.withGuard`.

```typescript
// use Buffer.isBuffer, which is typed as: isBuffer(obj: any): obj is Buffer;
const B = Guard(Buffer.isBuffer);
type T = Static<typeof B>; // T will have type of `Buffer`
```

## Template literals

The `Template` runtype validates that a value is a string that conforms to the template.

You can use the familiar syntax to create a `Template` runtype:

```ts
const T = Template`foo${Literal('bar')}baz`;
```

But then the type inference won't work:

```ts
type T = Static<typeof T>; // inferred as string
```

Because TS doesn't provide the exact string literal type information (`["foo", "baz"]` in this case) to the underlying function. See the issue [microsoft/TypeScript#33304](https://github.com/microsoft/TypeScript/issues/33304), especially this comment [microsoft/TypeScript#33304 (comment)](https://github.com/microsoft/TypeScript/issues/33304#issuecomment-697977783) we hope to be implemented.

If you want the type inference rather than the tagged syntax, you have to manually write a function call:

```ts
const T = Template(['foo', 'baz'] as const, Literal('bar'));
type T = Static<typeof T>; // inferred as "foobarbaz"
```

As a convenient solution for this, it also supports another style of passing arguments:

```ts
const T = Template('foo', Literal('bar'), 'baz');
type T = Static<typeof T>; // inferred as "foobarbaz"
```

You can pass various things to the `Template` constructor, as long as they are assignable to `string | number | bigint | boolean | null | undefined` and the corresponding `Runtype`s:

```ts
// Equivalent runtypes
Template(Literal('42'));
Template(42);
Template(Template('42'));
Template(4, '2');
Template(Literal(4), '2');
Template(String.withConstraint(s => s === '42'));
Template(
  Intersect(
    Number.withConstraint(n => n === 42),
    String.withConstraint(s => s.length === 2),
    // `Number`s in `Template` accept alternative representations like `"0x2A"`,
    // thus we have to constraint the length of string, to accept only `"42"`
  ),
);
```

Trivial items such as bare literals, `Literal`s, and single-element `Union`s and `Intersect`s are all coerced into strings at the creation time of the runtype. Additionally, `Union`s of such runtypes are converted into `RegExp` patterns like `(?:foo|bar|...)`, so we can assume `Union` of `Literal`s is a fully supported runtype in `Template`.

### Caveats

A `Template` internally constructs a `RegExp` to parse strings. This can lead to a problem if it contains multiple non-literal runtypes:

```ts
const UpperCaseString = Constraint(String, s => s === s.toUpperCase(), {
  name: 'UpperCaseString',
});
const LowerCaseString = Constraint(String, s => s === s.toLowerCase(), {
  name: 'LowerCaseString',
});
Template(UpperCaseString, LowerCaseString);
```

The only thing we can do for parsing such strings correctly is brute-forcing every single possible combination until it fulfills all the constraints, which must be hardly done. Actually `Template` treats `String` runtypes as the simplest `RegExp` pattern `.*` and the “greedy” strategy is always used, that is, the above runtype won't work expectedly because the entire pattern is just `^(.*)(.*)$` and the first `.*` always wins. You have to avoid using `Constraint` this way, and instead manually parse it using a single `Constraint` which covers the entire string.

## Function contracts

Runtypes along with constraint checking are a natural fit for enforcing function
contracts. You can construct a contract from `Runtype`s for the parameters and
return type of the function:

```ts
const divide = Contract(
  // Parameters:
  Number,
  Number.withConstraint(n => n !== 0 || 'division by zero'),
  // Return type:
  Number,
).enforce((n, m) => n / m);

divide(10, 2); // 5

divide(10, 0); // Throws error: division by zero
```

## Branded types

Branded types is a way to emphasize the uniqueness of a type. This is useful [until we have nominal types](https://github.com/microsoft/TypeScript/pull/33038):

```ts
const Username = String.withBrand('Username');
const Password = String.withBrand('Password').withConstraint(
  str => str.length >= 8 || 'Too short password',
);

const signIn = Contract(Username, Password, Unknown).enforce((username, password) => {
  /*...*/
});

const username = Username.check('someone@example.com');
const password = Password.check('12345678');

// Static type OK, runtime OK
signIn(username, password);

// Static type ERROR, runtime OK
signIn(password, username);

// Static type ERROR, runtime OK
signIn('someone@example.com', '12345678');
```

Branded types are like [opaque types](https://flow.org/en/docs/types/opaque-types) and work as expected, except it is impossible to use as a key of an object type:

```ts
const StringBranded = String.withBrand('StringBranded');
type StringBranded = Static<typeof StringBranded>;
// Then the type `StringBranded` is computed as:
// string & { [RuntypeName]: "StringBranded" }

// TS1023: An index signature parameter type must be either `string` or `number`.
type SomeObject1 = { [K: StringBranded]: number };

// Both of these result in empty object type i.e. `{}`
type SomeObject2 = { [K in StringBranded]: number };
type SomeObject3 = Record<StringBranded, number>;

// You can do like this, but...
const key = StringBranded.check('key');
const SomeRecord = Record({ [key]: Number });
// This type results in { [x: string]: number }
type SomeRecord = Static<typeof SomeRecord>;

// So you have to use `Map` to achieve strongly-typed branded keys
type SomeMap = Map<StringBranded, number>;
```

## Optional values

Runtypes can be used to represent a variable that may be undefined.

```ts
// For variables that might be `string | undefined`
Union(String, Undefined);
String.Or(Undefined); // shorthand syntax for the above
Optional(String); // equivalent to the above two basically
String.optional(); // shorthand syntax for the above
```

The last syntax is not any shorter than writing `Optional(String)` when you import `Optional` directly from `runtypes`, but if you use scoped import i.e. `import * as rt from 'runtypes'`, it would look better to write `rt.String.optional()` rather than `rt.Optional(rt.String)`.

If a `Record` may or may not have some properties, we can declare the optional properties using `Record({ x: Optional(String) })` (or formerly `Partial({ x: String })`). Optional properties validate successfully if they are absent or `undefined` or the type specified.

```ts
// Using `Ship` from above
const RegisteredShip = Ship.And(
  Record({
    // All registered ships must have this flag
    isRegistered: Literal(true),

    // We may or may not know the ship's classification
    shipClass: Optional(Union(Literal('military'), Literal('civilian'))),

    // We may not know the ship's rank (so we allow it to be undefined via `Optional`),
    // we may also know that a civilian ship doesn't have a rank (e.g. null)
    rank: Optional(Rank.Or(Null)),
  }),
);
```

There's a difference between `Union(String, Undefined)` and `Optional(String)` iff they are used within a `Record`; the former means "_**it must be present**, and must be `string` or `undefined`_", while the latter means "_**it can be present or missing**, but must be `string` or `undefined` if present_".

**_Prior to v5.2, `Union(..., Undefined)` in a `Record` was passing even if the property was missing. Although some users considered this behavior was a [bug](https://github.com/pelotom/runtypes/issues/182) especially for the sake of mirroring TS behavior, it was a long-standing thing, and some other users have been surprised with this fix. So the v5.2 release has been marked [deprecated on npm](https://www.npmjs.com/package/runtypes/v/5.2.0), due to the breaking change._**

Note that `null` is a quite different thing than `undefined` in JS and TS, so `Optional` doesn't take care of it. If your `Record` has properties which can be `null`, then use the `Null` runtype explicitly.

```ts
const MilitaryShip = Ship.And(
  Record({
    shipClass: Literal('military'),

    // Must NOT be undefined, but can be null
    lastDeployedTimestamp: Number.Or(Null),
  }),
);
```

You can save an import by using `nullable` shorthand instead. All three below are equivalent things.

```ts
Union(Number, Null);
Number.Or(Null);
Number.nullable();
```

## Readonly records and arrays

Array and Record runtypes have a special function `.asReadonly()`, that creates a new runtype where the values are readonly.

For example:

```typescript
const Asteroid = Record({
  type: Literal('asteroid'),
  location: Vector,
  mass: Number,
}).asReadonly();
type Asteroid = Static<typeof Asteroid>;
// { readonly type: 'asteroid', readonly location: Vector, readonly mass: number }

const AsteroidArray = Array(Asteroid).asReadonly();
type AsteroidArray = Static<typeof AsteroidArray>;
// ReadonlyArray<Asteroid>
```

## Helper functions for `Record`

`Record` runtype has the methods `.pick()` and `.omit()`, which will return a new `Record` with or without specified fields (see [Example](#example) section for detailed definition of `Rank` and `Planet`):

```ts
const CrewMember = Record({
  name: String,
  age: Number,
  rank: Rank,
  home: Planet,
});

const Visitor = CrewMember.pick('name', 'home');
type Visitor = Static<typeof Visitor>; // { name: string; home: Planet; }

const Background = CrewMember.omit('name');
type Background = Static<typeof Background>; // { age: number; rank: Rank; home: Planet; }
```

Also you can use `.extend()` to get a new `Record` with extended fields:

```ts
const PetMember = CrewMember.extend({
  species: String,
});
type PetMember = Static<typeof PetMember>;
// { name: string; age: number; rank: Rank; home: Planet; species: string; }
```

It is capable of reporting compile-time errors if any field is not assignable to the base runtype. You can suppress this error by using `@ts-ignore` directive or `.omit()` before, and then you'll get an incompatible version from the base `Record`.

```ts
const WrongMember = CrewMember.extend({
  rank: Literal('wrong'),
  // Type '"wrong"' is not assignable to type '"captain" | "first mate" | "officer" | "ensign"'.
});
```

## Related libraries

- [generate-runtypes](https://github.com/cobraz/generate-runtypes#readme) Generates runtypes from structured data. Useful for code generators
- [json-to-runtypes](https://github.com/runeh/json-to-runtypes#readme) Generates runtypes by parsing example JSON data
- [rest.ts](https://github.com/hmil/rest.ts) Allows building type safe and runtime-checked APIs
- [runtypes-generate](https://github.com/typeetfunc/runtypes-generate) Generates random data by `Runtype` for property-based testing
- [runtyping](https://github.com/johngeorgewright/runtyping) Generate runtypes from static types & JSON schema
- [schemart](https://github.com/codemariner/schemart) Generate runtypes from your database schema.
