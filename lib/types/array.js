"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
/**
 * Construct an array runtype from a runtype for its elements.
 */
function Arr(element) {
    return runtype_1.create(function (xs) {
        if (!Array.isArray(xs))
            throw runtype_1.validationError("Expected array but was " + typeof xs);
        for (var _i = 0, xs_1 = xs; _i < xs_1.length; _i++) {
            var x = xs_1[_i];
            element.check(x);
        }
        return xs;
    }, { tag: 'array', element: element });
}
exports.Array = Arr;
