"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
var validation_error_1 = require("../validation-error");
/**
 * Validates nothing (always fails).
 */
exports.Never = runtype_1.create(function () {
    throw new validation_error_1.ValidationError('Expected nothing but got something');
}, { tag: 'never' });
