"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../index");
var NonNegative = index_1.Number.withConstraint(function (n) { return n >= 0; });
var Vector = index_1.Tuple(index_1.Number, index_1.Number, index_1.Number);
var Asteroid = index_1.Record({
    type: index_1.Literal('asteroid'),
    location: Vector,
    mass: NonNegative,
});
var Planet = index_1.Record({
    type: index_1.Literal('planet'),
    location: Vector,
    mass: NonNegative,
    population: NonNegative,
    habitable: index_1.Boolean,
});
var Rank = index_1.Union(index_1.Literal('captain'), index_1.Literal('first mate'), index_1.Literal('officer'), index_1.Literal('ensign'));
var CrewMember = index_1.Record({
    name: index_1.String,
    age: NonNegative,
    rank: Rank,
    home: Planet,
});
var Ship = index_1.Record({
    type: index_1.Literal('ship'),
    location: Vector,
    mass: NonNegative,
    name: index_1.String,
    crew: index_1.Array(CrewMember),
});
var Fleet = index_1.Dictionary(Ship, 'number');
var SpaceObject = index_1.Union(Asteroid, Planet, Ship);
