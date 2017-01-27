"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Validates anything, but provides no new type information about it.
 */
exports.anything = validator(function (x) { return x; });
/**
 * Validates nothing (always fails).
 */
exports.nothing = validator(function (x) {
    throw new ValidationError('Expected nothing but got something');
});
/**
 * Validates that a value is a boolean.
 */
exports.boolean = validator(function (x) {
    if (typeof x !== 'boolean')
        throw new ValidationError("Expected boolean but was " + typeof x);
    return x;
});
/**
 * Validates that a value is a number.
 */
exports.number = validator(function (x) {
    if (typeof x !== 'number')
        throw new ValidationError("Expected number but was " + typeof x);
    return x;
});
/**
 * Validates that a value is a string.
 */
exports.string = validator(function (x) {
    if (typeof x !== 'string')
        throw new ValidationError("Expected string but was " + typeof x);
    return x;
});
/**
 * Construct a validator of literals.
 */
function literal(l) {
    return validator(function (x) {
        if (x !== l)
            throw new ValidationError("Expected literal '" + l + "' but was '" + x + "'");
        return x;
    });
}
exports.literal = literal;
/**
 * Construct a validator of arrays from a validator for its elements.
 */
function array(v) {
    return validator(function (xs) {
        if (!(xs instanceof Array))
            throw new ValidationError("Expected array but was " + typeof xs);
        for (var _i = 0, xs_1 = xs; _i < xs_1.length; _i++) {
            var x = xs_1[_i];
            v.coerce(x);
        }
        return xs;
    });
}
exports.array = array;
function tuple() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var lastArg = args[args.length - 1];
    var strict;
    var validators;
    if (exports.boolean.guard(lastArg)) {
        strict = lastArg;
        validators = args.slice(0, args.length - 1);
    }
    else {
        strict = false;
        validators = args;
    }
    return validator(function (x) {
        var xs = array(exports.anything).coerce(x);
        if (strict ? xs.length !== validators.length : xs.length < validators.length)
            throw new ValidationError("Expected array of " + validators.length + " but was " + xs.length);
        for (var i = 0; i < validators.length; i++)
            validators[i].coerce(xs[i]);
        return x;
    });
}
exports.tuple = tuple;
/**
 * Construct a validator of records from validators for its values.
 */
function record(validators) {
    return validator(function (x) {
        if (typeof x !== 'object')
            throw new ValidationError("Expected object but was " + typeof x);
        // tslint:disable-next-line:forin
        for (var key in validators)
            validators[key].coerce(x[key]);
        return x;
    });
}
exports.record = record;
function union() {
    var validators = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        validators[_i] = arguments[_i];
    }
    return validator(function (x) {
        for (var _i = 0, validators_1 = validators; _i < validators_1.length; _i++) {
            var guard = validators_1[_i].guard;
            if (guard(x))
                return x;
        }
        throw new Error('No alternatives were matched');
    });
}
exports.union = union;
function validator(coerce) {
    var falseWitness = undefined;
    return { coerce: coerce, validate: validate, guard: guard, falseWitness: falseWitness };
    function validate(value) {
        try {
            coerce(value);
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
}
var ValidationError = (function (_super) {
    __extends(ValidationError, _super);
    function ValidationError(message) {
        return _super.call(this, message) || this;
    }
    return ValidationError;
}(Error));
