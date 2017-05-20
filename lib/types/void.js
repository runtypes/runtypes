"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
/**
 * Validates that a value is void (null or undefined).
 */
exports.Void = runtype_1.create(function (x) {
    if (x !== undefined && x !== null)
        throw runtype_1.validationError("Expected null but was " + typeof x);
    return x;
}, { tag: 'void' });
