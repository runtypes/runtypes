"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
var string_1 = require("./string");
function Constraint(underlying, constraint, args) {
    return runtype_1.create(function (x) {
        var typed = underlying.check(x);
        var result = constraint(typed);
        if (string_1.String.guard(result))
            throw runtype_1.validationError(result);
        else if (!result)
            throw runtype_1.validationError('Failed constraint check');
        return typed;
    }, { tag: 'constraint', underlying: underlying, args: args, constraint: constraint });
}
exports.Constraint = Constraint;
