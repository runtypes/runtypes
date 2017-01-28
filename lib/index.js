"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Validates anything, but provides no new type information about it.
 */
exports.anything = runtype(function (x) { return x; });
/**
 * Validates nothing (always fails).
 */
exports.nothing = runtype(function (x) {
    throw new ValidationError('Expected nothing but got something');
});
/**
 * Validates that a value is a boolean.
 */
exports.boolean = runtype(function (x) {
    if (typeof x !== 'boolean')
        throw new ValidationError("Expected boolean but was " + typeof x);
    return x;
});
/**
 * Validates that a value is a number.
 */
exports.number = runtype(function (x) {
    if (typeof x !== 'number')
        throw new ValidationError("Expected number but was " + typeof x);
    return x;
});
/**
 * Validates that a value is a string.
 */
exports.string = runtype(function (x) {
    if (typeof x !== 'string')
        throw new ValidationError("Expected string but was " + typeof x);
    return x;
});
/**
 * Construct a literal runtype.
 */
function literal(l) {
    return runtype(function (x) {
        if (x !== l)
            throw new ValidationError("Expected literal '" + l + "' but was '" + x + "'");
        return x;
    });
}
exports.literal = literal;
/**
 * Construct an array runtype from a runtype for its elements.
 */
function array(v) {
    return runtype(function (xs) {
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
    var runtypes;
    if (exports.boolean.guard(lastArg)) {
        strict = lastArg;
        runtypes = args.slice(0, args.length - 1);
    }
    else {
        strict = false;
        runtypes = args;
    }
    return runtype(function (x) {
        var xs = array(exports.anything).coerce(x);
        if (strict ? xs.length !== runtypes.length : xs.length < runtypes.length)
            throw new ValidationError("Expected array of " + runtypes.length + " but was " + xs.length);
        for (var i = 0; i < runtypes.length; i++)
            runtypes[i].coerce(xs[i]);
        return x;
    });
}
exports.tuple = tuple;
/**
 * Construct a record runtype from runtypes for its values.
 */
function record(runtypes) {
    return runtype(function (x) {
        if (typeof x !== 'object')
            throw new ValidationError("Expected object but was " + typeof x);
        // tslint:disable-next-line:forin
        for (var key in runtypes)
            runtypes[key].coerce(x[key]);
        return x;
    });
}
exports.record = record;
function union() {
    var runtypes = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        runtypes[_i] = arguments[_i];
    }
    return runtype(function (x) {
        for (var _i = 0, runtypes_1 = runtypes; _i < runtypes_1.length; _i++) {
            var guard = runtypes_1[_i].guard;
            if (guard(x))
                return x;
        }
        throw new Error('No alternatives were matched');
    });
}
exports.union = union;
function runtype(coerce) {
    var witness = undefined;
    return { coerce: coerce, validate: validate, guard: guard, witness: witness };
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
