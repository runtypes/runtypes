"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
var string_1 = require("./string");
function Custom(underlying, constraint, tag, args) {
    return runtype_1.create(function (x) {
        var typed = underlying.check(x);
        var result = constraint(typed, args);
        if (string_1.String.guard(result))
            throw runtype_1.validationError(result);
        else if (!result)
            throw runtype_1.validationError('Failed constraint check');
        return typed;
    }, { tag: tag, underlying: underlying, constraint: constraint, args: args });
}
exports.Custom = Custom;
