"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
/**
 * Validates nothing (always fails).
 */
exports.Never = runtype_1.create(function () {
    throw runtype_1.validationError('Expected nothing but got something');
}, { tag: 'never' });
