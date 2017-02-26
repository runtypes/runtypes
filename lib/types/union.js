"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
function Union() {
    var alternatives = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        alternatives[_i] = arguments[_i];
    }
    return runtype_1.create(function (x) {
        for (var _i = 0, alternatives_1 = alternatives; _i < alternatives_1.length; _i++) {
            var guard = alternatives_1[_i].guard;
            if (guard(x))
                return x;
        }
        throw new Error('No alternatives were matched');
    }, { tag: 'union', alternatives: alternatives });
}
exports.Union = Union;
