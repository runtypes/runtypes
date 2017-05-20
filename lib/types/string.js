"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
/**
 * Validates that a value is a string.
 */
exports.String = runtype_1.create(function (x) {
    if (typeof x !== 'string')
        throw runtype_1.validationError("Expected string but was " + typeof x);
    return x;
}, { tag: 'string' });
