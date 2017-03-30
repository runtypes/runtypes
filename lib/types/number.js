"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
/**
 * Validates that a value is a number.
 */
exports.Number = runtype_1.create(function (x) {
    if (typeof x !== 'number')
        throw runtype_1.validationError("Expected number but was " + typeof x);
    return x;
}, { tag: 'number' });
