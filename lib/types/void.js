"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
var validation_error_1 = require("../validation-error");
/**
 * Validates that a value is void (null or undefined).
 */
exports.Void = runtype_1.create(function (x) {
    if (x !== undefined && x !== null)
        throw new validation_error_1.ValidationError("Expected null but was " + typeof x);
    return x;
}, { tag: 'void' });
