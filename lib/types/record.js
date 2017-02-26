"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
var util_1 = require("../util");
var validation_error_1 = require("../validation-error");
/**
 * Construct a record runtype from runtypes for its values.
 */
function Record(fields) {
    return runtype_1.create(function (x) {
        if (x === null || x === undefined)
            throw new validation_error_1.ValidationError("Expected a defined non-null value but was " + typeof x);
        // tslint:disable-next-line:forin
        for (var key in fields) {
            if (util_1.hasKey(key, x))
                fields[key].check(x[key]);
            else
                throw new validation_error_1.ValidationError("Missing property " + key);
        }
        return x;
    }, { tag: 'record', fields: fields });
}
exports.Record = Record;
