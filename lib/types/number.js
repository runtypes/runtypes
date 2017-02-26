"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
var validation_error_1 = require("../validation-error");
/**
 * Validates that a value is a number.
 */
exports.Number = runtype_1.create(function (x) {
    if (typeof x !== 'number')
        throw new validation_error_1.ValidationError("Expected number but was " + typeof x);
    return x;
}, { tag: 'number' });
