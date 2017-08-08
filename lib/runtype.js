"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
    function withConstraint(constraint, args) {
        return index_1.Constraint(A, constraint, args);
    }
}
exports.create = create;
var ValidationError = (function (_super) {
    __extends(ValidationError, _super);
    function ValidationError(message) {
        return _super.call(this, message) || this;
    }
    return ValidationError;
}(Error));
exports.ValidationError = ValidationError;
function validationError(message) {
    return new ValidationError(message);
}
exports.validationError = validationError;
