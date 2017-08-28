# Runtypes [![Build Status](https://travis-ci.org/pelotom/runtypes.svg?branch=master)](https://travis-ci.org/pelotom/runtypes) [![Coverage Status](https://coveralls.io/repos/pelotom/runtypes/badge.svg?branch=master)](https://coveralls.io/github/pelotom/runtypes?branch=master)

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
type Vector = [number, number, number]

type Asteroid = {
  type: 'asteroid'
  location: Vector
  mass: number
}

type Planet = {
  type: 'planet'
  location: Vector
  mass: number
  population: number
  habitable: boolean
}

type Rank =
  | 'captain'
  | 'first mate'
  | 'officer'
  | 'ensign'

type CrewMember = {
  name: string
  age: number
  rank: Rank
  home: Planet
}

type Ship = {
  type: 'ship'
  location: Vector
  mass: number
  name: string
  crew: CrewMember[]
}

type SpaceObject = Asteroid | Planet | Ship
```

If the objects which are supposed to have these shapes are loaded from some external source, perhaps a JSON file, we need to
validate that the objects conform to their specifications. We do so by building corresponding `Runtype`s in a very straightforward
manner:

```ts
import { Boolean, Number, String, Literal, Array, Tuple, Record, Union } from 'runtypes'

const Vector = Tuple(Number, Number, Number)

const Asteroid = Record({
  type: Literal('asteroid'),
  location: Vector,
  mass: Number,
})

const Planet = Record({
  type: Literal('planet'),
  location: Vector,
  mass: Number,
  population: Number,
  habitable: Boolean,
})

const Rank = Union(
  Literal('captain'),
  Literal('first mate'),
  Literal('officer'),
  Literal('ensign'),
)

const CrewMember = Record({
  name: String,
  age: Number,
  rank: Rank,
  home: Planet,
})

const Ship = Record({
  type: Literal('ship'),
  location: Vector,
  mass: Number,
  name: String,
  crew: Array(CrewMember),
})

const SpaceObject = Union(Asteroid, Planet, Ship)
```

(See the [examples](src/examples) directory for an expanded version of this.)

Now if we are given a putative `SpaceObject` we can validate it like so:

```ts
// spaceObject: SpaceObject
const spaceObject = SpaceObject.check(obj)
```

If the object doesn't conform to the type specification, `check` will throw an exception.

## Static type inference

In TypeScript, the inferred type of `Asteroid` in the above example is

```ts
Runtype<{
  type: 'asteroid'
  coordinates: [number, number, number]
  mass: number
}>
```

That is, it's a `Runtype<Asteroid>`, and you could annotate it as such. But we don't really have to define the
`Asteroid` type in TypeScript at all now, because the inferred type is correct. Defining each of your types
twice, once at the type level and then again at the value level, is a pain and not very [DRY](https://en.wikipedia.org/wiki/Don't_repeat_yourself).
Fortunately you can define a static `Asteroid` type which is an alias to the `Runtype`-derived type like so:

```ts
import { Static } from 'runtypes'

type Asteroid = Static<typeof Asteroid>
```

which achieves the same result as

```ts
type Asteroid = {
  type: 'asteroid'
  coordinates: [number, number, number]
  mass: number
}
```

## Type guards

In addition to providing a `check` method, runtypes can be used as [type guards](https://basarat.gitbooks.io/typescript/content/docs/types/typeGuard.html):

```ts
function disembark(obj: {}) {
    if (SpaceObject.guard(obj)) {
        // obj: SpaceObject
        if (obj.type === 'ship') {
            // obj: Ship
            obj.crew = []
        }
    }
}
```

## Constraint checking

Beyond mere type checking, we can add arbitrary runtime constraints to a `Runtype`:

```ts
const Positive = Number.withConstraint(n => n > 0)

Positive.check(-3) // Throws error: Failed constraint check
```

You can provide more descriptive error messages for failed constraints by returning
a string instead of `false`:


```ts
const Positive = Number.withConstraint(n => n > 0 || `${n} is not positive`)

Positive.check(-3) // Throws error: -3 is not positive
```

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
  Number
).enforce((n, m) => n / m)

divide(10, 2) // 5

divide(10, 0) // Throws error: division by zero
```

## Related libraries

- [runtypes-generate](https://github.com/typeetfunc/runtypes-generate) Generates random data by `Runtype` for property-based testing
