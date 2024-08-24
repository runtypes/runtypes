import {
	Boolean,
	Number,
	String,
	Literal,
	Array,
	Tuple,
	Object,
	Dictionary,
	Union,
	type Static,
} from "../../src/index.ts"

const NonNegative = Number.withConstraint(n => n >= 0)
type NonNegative = Static<typeof NonNegative> // = number

const Vector = Tuple(Number, Number, Number)
type Vector = Static<typeof Vector> // = [number, number, number]

const Asteroid = Object({
	type: Literal("asteroid"),
	location: Vector,
	mass: NonNegative,
})
type Asteroid = Static<typeof Asteroid> /* = {
	type: 'asteroid';
	location: Vector;
	mass: NonNegative;
}*/

const Planet = Object({
	type: Literal("planet"),
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

const Rank = Union(Literal("captain"), Literal("first mate"), Literal("officer"), Literal("ensign"))
type Rank = Static<typeof Rank> // = 'captain' | 'first mate' | 'officer' | 'ensign'

const CrewMember = Object({
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

const Ship = Object({
	type: Literal("ship"),
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

const Fleet = Dictionary(Ship, "number")
type Fleet = Static<typeof Fleet> // = { [_: number]: Ship }

const SpaceObject = Union(Asteroid, Planet, Ship)
type SpaceObject = Static<typeof SpaceObject> // = Asteroid | Planet | Ship

const isHabitable = SpaceObject.match(
	asteroid => false,
	planet => planet.habitable,
	ship => true,
)

// Pattern matching from a union
const foo = (spaceObject: SpaceObject) => {
	if (isHabitable(spaceObject)) {
		// ...
	}
}