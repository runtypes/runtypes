"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Validates anything, but provides no new type information about it.
 */
exports.Always = runtype(function (x) { return x; });
/**
 * Validates nothing (always fails).
 */
exports.Never = runtype(function (x) {
    throw new ValidationError('Expected nothing but got something');
});
/**
 * Validates that a value is undefined.
 */
exports.Undefined = runtype(function (x) {
    if (x !== undefined)
        throw new ValidationError("Expected undefined but was " + typeof x);
    return x;
});
/**
 * Validates that a value is null.
 */
exports.Null = runtype(function (x) {
    if (x !== null)
        throw new ValidationError("Expected null but was " + typeof x);
    return x;
});
/**
 * Validates that a value is void (null or undefined).
 */
exports.Void = runtype(function (x) {
    if (x !== undefined && x !== null)
        throw new ValidationError("Expected null but was " + typeof x);
    return x;
});
/**
 * Validates that a value is a boolean.
 */
exports.Boolean = runtype(function (x) {
    if (typeof x !== 'boolean')
        throw new ValidationError("Expected boolean but was " + typeof x);
    return x;
});
/**
 * Validates that a value is a number.
 */
exports.Number = runtype(function (x) {
    if (typeof x !== 'number')
        throw new ValidationError("Expected number but was " + typeof x);
    return x;
});
/**
 * Validates that a value is a string.
 */
exports.String = runtype(function (x) {
    if (typeof x !== 'string')
        throw new ValidationError("Expected string but was " + typeof x);
    return x;
});
/**
 * Construct a literal runtype.
 */
function Literal(l) {
    return runtype(function (x) {
        if (x !== l)
            throw new ValidationError("Expected literal '" + l + "' but was '" + x + "'");
        return x;
    });
}
exports.Literal = Literal;
/**
 * Construct an array runtype from a runtype for its elements.
 */
function arr(v) {
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
exports.Array = arr;
function Tuple() {
    var runtypes = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        runtypes[_i] = arguments[_i];
    }
    return runtype(function (x) {
        var xs = arr(exports.Always).coerce(x);
        if (xs.length < runtypes.length)
            throw new ValidationError("Expected array of " + runtypes.length + " but was " + xs.length);
        for (var i = 0; i < runtypes.length; i++)
            runtypes[i].coerce(xs[i]);
        return x;
    });
}
exports.Tuple = Tuple;
/**
 * Construct a record runtype from runtypes for its values.
 */
function Record(runtypes) {
    return runtype(function (x) {
        if (x === null || x === undefined)
            throw new ValidationError("Expected a defined non-null value but was " + typeof x);
        // tslint:disable-next-line:forin
        for (var key in runtypes) {
            if (hasKey(key, x))
                runtypes[key].coerce(x[key]);
            else
                throw new ValidationError("Missing property " + key);
        }
        return x;
    });
}
exports.Record = Record;
/**
 * Construct a runtype for records of optional values.
 */
function Optional(runtypes) {
    return runtype(function (x) {
        if (x === null || x === undefined)
            throw new ValidationError("Expected a defined non-null value but was " + typeof x);
        // tslint:disable-next-line:forin
        for (var key in runtypes)
            if (hasKey(key, x))
                Union(runtypes[key], exports.Undefined).coerce(x[key]);
        return x;
    });
}
exports.Optional = Optional;
function Union() {
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
exports.Union = Union;
function Intersect() {
    var runtypes = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        runtypes[_i] = arguments[_i];
    }
    return runtype(function (x) {
        for (var _i = 0, runtypes_2 = runtypes; _i < runtypes_2.length; _i++) {
            var coerce = runtypes_2[_i].coerce;
            coerce(x);
        }
        return x;
    });
}
exports.Intersect = Intersect;
/**
 * Constructs a possibly-recursive Runtype.
 */
function Lazy(fn) {
    var cached;
    return runtype(function (x) {
        if (!cached)
            cached = fn();
        return cached.coerce(x);
    });
}
exports.Lazy = Lazy;
function runtype(coerce) {
    var A = {
        coerce: coerce,
        validate: validate,
        guard: guard,
        Or: Or,
        And: And,
        _falseWitness: undefined,
    };
    return A;
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
    function Or(B) {
        return Union(A, B);
    }
    function And(B) {
        return Intersect(A, B);
    }
}
var ValidationError = (function (_super) {
    __extends(ValidationError, _super);
    function ValidationError(message) {
        return _super.call(this, message) || this;
    }
    return ValidationError;
}(Error));
// Type guard to determine if an object has a given key
// If this feature gets implemented, we can use `in` instead: https://github.com/Microsoft/TypeScript/issues/10485
function hasKey(k, o) {
    return typeof o === 'object' && k in o;
}
exports.hasKey = hasKey;
