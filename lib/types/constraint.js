"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
var string_1 = require("./string");
var validation_error_1 = require("../validation-error");
function Constraint(underlying, constraint) {
    return runtype_1.create(function (x) {
        var typed = underlying.check(x);
        var result = constraint(typed);
        if (string_1.String.guard(result))
            throw new validation_error_1.ValidationError(result);
        else if (!result)
            throw new validation_error_1.ValidationError('Failed constraint check');
        return typed;
    }, { tag: 'constraint', underlying: underlying });
}
exports.Constraint = Constraint;
