"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./index");
var show_1 = require("./show");
function create(check, A) {
    A.check = check;
    A.validate = validate;
    A.guard = guard;
    A.Or = Or;
    A.And = And;
    A.withConstraint = withConstraint;
    A.reflect = A;
    A.toString = function () { return "Runtype<" + show_1.default(A) + ">"; };
    return A;
    function validate(value) {
        try {
            check(value);
            return { success: true, value: value };
        }
        catch (_a) {
            var message = _a.message;
            return { success: false, message: message };
        }
    }
    function guard(x) {
        return validate(x).success;
    }
    function Or(B) {
        return index_1.Union(A, B);
    }
    function And(B) {
        return index_1.Intersect(A, B);
    }
    function withConstraint(constraint) {
        return index_1.Constraint(A, constraint);
    }
}
exports.create = create;
