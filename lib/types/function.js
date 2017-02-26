"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
var validation_error_1 = require("../validation-error");
/**
 * Construct a runtype for functions.
 */
exports.Function = runtype_1.create(function (x) {
    if (typeof x !== 'function')
        throw new validation_error_1.ValidationError("Expected a function but was " + typeof x);
    return x;
}, { tag: 'function' });
