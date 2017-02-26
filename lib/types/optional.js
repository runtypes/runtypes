"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
var index_1 = require("../index");
var literal_1 = require("./literal");
var util_1 = require("../util");
var validation_error_1 = require("../validation-error");
/**
 * Construct a runtype for records of optional values.
 */
function Optional(fields) {
    return runtype_1.create(function (x) {
        if (x === null || x === undefined)
            throw new validation_error_1.ValidationError("Expected a defined non-null value but was " + typeof x);
        // tslint:disable-next-line:forin
        for (var key in fields)
            if (util_1.hasKey(key, x))
                index_1.Union(fields[key], literal_1.Undefined).check(x[key]);
        return x;
    }, { tag: 'optional', fields: fields });
}
exports.Optional = Optional;
