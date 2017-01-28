# Runtypes - Bring untyped data into the fold, safely

[![Build Status](https://travis-ci.org/pelotom/runtypes.svg?branch=master)](https://travis-ci.org/pelotom/runtypes)

Runtypes is a JavaScript and TypeScript library which allows you to take values about which you have no assurances and check
that they conform to some type `A`. This is done by means of composable type validators of primitives, literals, arrays,
tuples, records and unions. Better yet, it has TypeScript bindings which allow exactly expressing the validated results in a type-safe
manner.

## Installation

```
npm install --save runtypes
```

## Example

For example, suppose you have objects which represent asteroids, planets, ships and personnel. In TypeScript, you might model
them like so:

```ts
type Coordinates = [number, number, number]

interface Asteroid {
  type: 'asteroid'
  coordinates: Coordinates
  mass: number
}

interface Planet {
  type: 'planet'
  coordinates: Coordinates
  mass: number
  population: number
  habitable: boolean
}

type Rank
  = 'captain'
  | 'first mate'
  | 'officer'
  | 'ensign'

interface CrewMember {
  name: string
  age: number
  rank: Rank
  home: Planet
}

interface Ship {
  type: 'ship'
  coordinates: Coordinates
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
import { boolean, number, string, literal, array, tuple, record, union } from 'runtypes'

const Coordinates = tuple(number, number, number)

const Asteroid = record({
  type: literal('asteroid'),
  coordinates: Coordinates,
  mass: number,
})

const Planet = record({
  type: literal('planet'),
  coordinates: Coordinates,
  mass: number,
  population: number,
  habitable: boolean,
})

const Rank = union(
  literal('captain'),
  literal('first mate'),
  literal('officer'),
  literal('ensign'),
)

const CrewMember = record({
  name: string,
  age: number,
  rank: Rank,
  home: Planet,
})

const Ship = record({
  type: literal('ship'),
  coordinates: Coordinates,
  mass: number,
  name: string,
  crew: array(CrewMember),
})

const SpaceObject = union(Asteroid, Planet, Ship)
```

Now if we are given a putative `SpaceObject` we can validate it like so:

```ts
// spaceObject: SpaceObject
const spaceObject = SpaceObject.coerce(obj)
```

If the object doesn't conform to the type specification, `coerce` will throw an exception.

## Type inference

In TypeScript, the inferred type of `Asteroid` in the above example is

```ts
Runtype<{
  type: 'asteroid'
  coordinates: [number, number, number]
  mass: number
}>
```

That is, it's a `Runtype<Asteroid>`, and you could annotate it as such. But we don't really have to define the
`Asteroid` interface in TypeScript at all now, because the inferred type is correct. Defining each of your types
twice, once at the type level and then again at the value level, is a pain and not very [DRY](https://en.wikipedia.org/wiki/Don't_repeat_yourself).
If you still want a static `Asteroid` type that you can refer to, you can make it an alias to the `Runtype`-derived
type like so:

```ts
type Asteroid = typeof Asteroid.witness
```

The `witness: A` field on a `Runtype<A>` is a lie--a false witness!--it's always `undefined`. But it's a useful one
because applying the `typeof` operator to it allows us to obtain the derived type `A` and make a type alias.

## Type guards

In addition to coercion, runtypes can be used as [type guards](https://basarat.gitbooks.io/typescript/content/docs/types/typeGuard.html):

```ts
function disembark(obj: {}) {
    if (SpaceObject.guard(obj)) {
        // obj: SpaceObject
        if (obj.type === 'ship) {
            // obj: Ship
            obj.crew = []
        }
    }
}
```
