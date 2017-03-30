"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
var record_1 = require("./record");
function Dictionary(value, key) {
    if (key === void 0) { key = 'string'; }
    return runtype_1.create(function (x) {
        record_1.Record({}).check(x);
        if (typeof x !== 'object')
            throw runtype_1.validationError("Expected an object but was " + typeof x);
        if (Object.getPrototypeOf(x) !== Object.prototype) {
            if (!Array.isArray(x))
                throw runtype_1.validationError("Expected simple object but was complex");
            else if (key === 'string')
                throw runtype_1.validationError("Expected dictionary but was array");
        }
        for (var k in x) {
            // Object keys are always strings
            if (key === 'number') {
                if (isNaN(+k))
                    throw runtype_1.validationError("Expected dictionary key to be a number but was string");
            }
            value.check(x[k]);
        }
        return x;
    }, { tag: 'dictionary', key: key, value: value });
}
exports.Dictionary = Dictionary;
