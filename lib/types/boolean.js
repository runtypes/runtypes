"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
var validation_error_1 = require("../validation-error");
/**
 * Validates that a value is a boolean.
 */
exports.Boolean = runtype_1.create(function (x) {
    if (typeof x !== 'boolean')
        throw new validation_error_1.ValidationError("Expected boolean but was " + typeof x);
    return x;
}, { tag: 'boolean' });
