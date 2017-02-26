"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
var validation_error_1 = require("../validation-error");
/**
 * Validates that a value is a string.
 */
exports.String = runtype_1.create(function (x) {
    if (typeof x !== 'string')
        throw new validation_error_1.ValidationError("Expected string but was " + typeof x);
    return x;
}, { tag: 'string' });
