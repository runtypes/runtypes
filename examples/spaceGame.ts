import { Boolean, Number, String, Literal, Array, Tuple, Record, Union, Static } from '../src/index'

const NonNegative = Number.withConstraint(n => n >= 0)

const Vector = Tuple(Number, Number, Number)
type Vector = Static<typeof Vector>

const Asteroid = Record({
  type: Literal('asteroid'),
  location: Vector,
  mass: NonNegative,
})
type Asteroid = Static<typeof Asteroid>

const Planet = Record({
  type: Literal('planet'),
  location: Vector,
  mass: NonNegative,
  population: NonNegative,
  habitable: Boolean,
})
type Planet = Static<typeof Planet>

const Rank = Union(
  Literal('captain'),
  Literal('first mate'),
  Literal('officer'),
  Literal('ensign'),
)
type Rank = Static<typeof Rank>

const CrewMember = Record({
  name: String,
  age: NonNegative,
  rank: Rank,
  home: Planet,
})
type CrewMember = Static<typeof CrewMember>

const Ship = Record({
  type: Literal('ship'),
  location: Vector,
  mass: NonNegative,
  name: String,
  crew: Array(CrewMember),
})
type Ship = Static<typeof Ship>

const SpaceObject = Union(Asteroid, Planet, Ship)
type SpaceObject = Static<typeof SpaceObject>
