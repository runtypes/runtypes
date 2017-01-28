# Runtypes - Bring untyped data into the fold, safely

[![Build Status](https://travis-ci.org/pelotom/runtypes.svg?branch=master)](https://travis-ci.org/pelotom/runtypes)

Runtypes is a JavaScript and TypeScript library which allows you to take values about which you have no assurances and ensure
that they conform to some type `A`. This is done by means of composable type validators of primitives, literals, arrays,
tuples, records, unions. Better yet, it has TypeScript bindings which allow exactly expressing the validated results in a type-safe
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
const Coordinates: Runtype<Coordinates> = tuple(number, number, number)

const Asteroid: Runtype<Asteroid> = record({
  type: literal('asteroid'),
  coordinates: Coordinates,
  mass: number,
})

const Planet: Runtype<Planet> = record({
  type: literal('planet'),
  coordinates: Coordinates,
  mass: number,
  population: number,
  habitable: boolean,
})

const Rank: Runtype<Rank> = union(
  literal('captain'),
  literal('first mate'),
  literal('officer'),
  literal('ensign'),
)

const CrewMember: Runtype<CrewMember> = record({
  name: string,
  age: number,
  rank: Rank,
  home: Planet,
})

const Ship: Runtype<Ship> = record({
  type: literal('ship'),
  coordinates: Coordinates,
  mass: number,
  name: string,
  crew: array(CrewMember),
})

const SpaceObject: Runtype<SpaceObject> = union(Asteroid, Planet, Ship)
```

Now if we are given a putative `SpaceObject` we can validate it like so:

```ts
const spaceObject: SpaceObject = SpaceObject.coerce(obj)
```

If the object doesn't conform to the type specification, `coerce` will throw an exception.

## Type inference

It's worth pointing out that all of the type annotations above are optional in TypeScript; the correct type parameter
for the composed `Runtype` will be inferred if you leave them off. In fact, you can skip writing out the TypeScript
types altogether and instead derive them from the `Runtype`s like so:

```ts
const Coordinates = tuple(number, number, number)
type Coordinates = typeof Coordinates.witness

const Asteroid = record({
  type: literal('asteroid'),
  coordinates: Coordinates,
  mass: number,
})
type Asteroid = typeof Asteroid.witness

const Planet = record({
  type: literal('planet'),
  coordinates: Coordinates,
  mass: number,
  population: number,
  habitable: boolean,
})
type Planet = typeof Planet.witness

const Rank = union(
  literal('captain'),
  literal('first mate'),
  literal('officer'),
  literal('ensign'),
)
type Rank = typeof Rank.witness

const CrewMember = record({
  name: string,
  age: number,
  rank: Rank,
  home: Planet,
})
type CrewMember = typeof CrewMember.witness

const Ship = record({
  type: literal('ship'),
  coordinates: Coordinates,
  mass: number,
  name: string,
  crew: array(CrewMember),
})
type Ship = typeof Ship.witness

const SpaceObject = union(Asteroid, Planet, Ship)
type SpaceObject = typeof SpaceObject.witness
```

For a given `r: Runtype<A>`, `r.witness: A` is always `undefined` in reality--it's a false witness! But even though it's a lie,
it's useful one because applying the `typeof` operator to it allows us to obtain the derived type `A`. This trick obviates the
need to repeat our type definitions at both the value and the type level. Nifty!

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
