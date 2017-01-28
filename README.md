# Runtypes [![Build Status](https://travis-ci.org/pelotom/runtypes.svg?branch=master)](https://travis-ci.org/pelotom/runtypes)

## Bring untyped data into the fold, safely

Runtypes is a JavaScript and TypeScript library which allows you to take values about which you have no assurances and ensure
that they conform to some type `A`. This is done by means of composable type validators of primitives, literals, arrays,
tuples, records, unions. Better yet, it has TypeScript bindings which allow exactly expressing the validated results in a type-safe
manner.

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

Now if I have been given a putative `SpaceObject` I can validate it like so:

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
type Coordinates = typeof Coordinates.falseWitness

const Asteroid = record({
  type: literal('asteroid'),
  coordinates: Coordinates,
  mass: number,
})
type Asteroid = typeof Asteroid.falseWitness

const Planet = record({
  type: literal('planet'),
  coordinates: Coordinates,
  mass: number,
  population: number,
  habitable: boolean,
})
type Planet = typeof Planet.falseWitness

const Rank = union(
  literal('captain'),
  literal('first mate'),
  literal('officer'),
  literal('ensign'),
)
type Rank = typeof Rank.falseWitness

const CrewMember = record({
  name: string,
  age: number,
  rank: Rank,
  home: Planet,
})
type CrewMember = typeof CrewMember.falseWitness

const Ship = record({
  type: literal('ship'),
  coordinates: Coordinates,
  mass: number,
  name: string,
  crew: array(CrewMember),
})
type Ship = typeof Ship.falseWitness

const SpaceObject = union(Asteroid, Planet, Ship)
type SpaceObject = typeof SpaceObject.falseWitness
```

For a given `r: Runtype<A>`, `r.falseWitness: A` is always `undefined`, but it can be used with the
type-level `typeof` operator in order to obtain the type `A`. This trick allows us to avoid having to repeat our
type definitions at both the value and type level. Nifty!

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