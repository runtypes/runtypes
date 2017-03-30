"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
var util_1 = require("../util");
/**
 * Construct a record runtype from runtypes for its values.
 */
function Record(fields) {
    return runtype_1.create(function (x) {
        if (x === null || x === undefined)
            throw runtype_1.validationError("Expected a defined non-null value but was " + typeof x);
        // tslint:disable-next-line:forin
        for (var key in fields) {
            if (util_1.hasKey(key, x)) {
                try {
                    fields[key].check(x[key]);
                }
                catch (_a) {
                    var message = _a.message;
                    throw runtype_1.validationError("In key " + key + ": " + message);
                }
            }
            else
                throw runtype_1.validationError("Missing property " + key);
        }
        return x;
    }, { tag: 'record', fields: fields });
}
exports.Record = Record;
