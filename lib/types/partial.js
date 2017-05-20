"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
var index_1 = require("../index");
var literal_1 = require("./literal");
var util_1 = require("../util");
/**
 * Construct a runtype for partial records
 */
function Part(fields) {
    return runtype_1.create(function (x) {
        if (x === null || x === undefined)
            throw runtype_1.validationError("Expected a defined non-null value but was " + typeof x);
        // tslint:disable-next-line:forin
        for (var key in fields)
            if (util_1.hasKey(key, x)) {
                try {
                    index_1.Union(fields[key], literal_1.Undefined).check(x[key]);
                }
                catch (_a) {
                    var message = _a.message;
                    throw runtype_1.validationError("In key " + key + ": " + message);
                }
            }
        return x;
    }, { tag: 'partial', fields: fields });
}
exports.Part = Part;
exports.Partial = Part;
