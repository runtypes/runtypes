"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
/**
 * Construct a runtype for functions.
 */
exports.Function = runtype_1.create(function (x) {
    if (typeof x !== 'function')
        throw runtype_1.validationError("Expected a function but was " + typeof x);
    return x;
}, { tag: 'function' });
