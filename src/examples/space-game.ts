import { Boolean, Number, String, Literal, Array, Tuple, Record, Dictionary, Union, Static } from '../index'

const NonNegative = Number.withConstraint(n => n >= 0)
type NonNegative = Static<typeof NonNegative> // = number

const Vector = Tuple(Number, Number, Number)
type Vector = Static<typeof Vector> // = [number, number, number]

const Asteroid = Record({
  type: Literal('asteroid'),
  location: Vector,
  mass: NonNegative,
})
type Asteroid = Static<typeof Asteroid> /* = {
  type: 'asteroid';
  location: Vector;
  mass: NonNegative;
}*/

const Planet = Record({
  type: Literal('planet'),
  location: Vector,
  mass: NonNegative,
  population: NonNegative,
  habitable: Boolean,
})
type Planet = Static<typeof Planet> /* = {
  type: 'planet';
  location: Vector;
  mass: NonNegative;
  population: NonNegative;
  habitable: Boolean;
}*/

const Rank = Union(
  Literal('captain'),
  Literal('first mate'),
  Literal('officer'),
  Literal('ensign'),
)
type Rank = Static<typeof Rank> // = 'captain' | 'first mate' | 'officer' | 'ensign'

const CrewMember = Record({
  name: String,
  age: NonNegative,
  rank: Rank,
  home: Planet,
})
type CrewMember = Static<typeof CrewMember> /* = {
  name: string;
  age: NonNegative;
  rank: Rank;
  home: Planet;
}*/

const Ship = Record({
  type: Literal('ship'),
  location: Vector,
  mass: NonNegative,
  name: String,
  crew: Array(CrewMember),
})
type Ship = Static<typeof Ship> /* = {
  type: 'ship';
  location: Vector;
  mass: NonNegative;
  name: string;
  crew: CrewMember[];
}*/

const Fleet = Dictionary(Ship, 'number')
type Fleet = Static<typeof Fleet> // = { [_: number]: Ship }

const SpaceObject = Union(Asteroid, Planet, Ship)
type SpaceObject = Static<typeof SpaceObject> // = Asteroid | Planet | Ship
