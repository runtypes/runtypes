"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
var always_1 = require("./always");
var array_1 = require("./array");
function Tuple() {
    var components = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        components[_i] = arguments[_i];
    }
    return runtype_1.create(function (x) {
        var xs = array_1.Array(always_1.Always).check(x);
        if (xs.length < components.length)
            throw runtype_1.validationError("Expected array of " + components.length + " but was " + xs.length);
        for (var i = 0; i < components.length; i++)
            components[i].check(xs[i]);
        return x;
    }, { tag: 'tuple', components: components });
}
exports.Tuple = Tuple;
