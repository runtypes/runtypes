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
            v.check(x);
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
        var xs = arr(exports.Always).check(x);
        if (xs.length < runtypes.length)
            throw new ValidationError("Expected array of " + runtypes.length + " but was " + xs.length);
        for (var i = 0; i < runtypes.length; i++)
            runtypes[i].check(xs[i]);
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
                runtypes[key].check(x[key]);
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
                Union(runtypes[key], exports.Undefined).check(x[key]);
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
            var check = runtypes_2[_i].check;
            check(x);
        }
        return x;
    });
}
exports.Intersect = Intersect;
/**
 * Construct a runtype for functions.
 */
exports.func = runtype(function (x) {
    if (typeof x !== 'function')
        throw new ValidationError("Expected a function but was " + typeof x);
    return x;
});
exports.Function = exports.func;
/**
 * Construct a possibly-recursive Runtype.
 */
function Lazy(fn) {
    var cached;
    return runtype(function (x) {
        if (!cached)
            cached = fn();
        return cached.check(x);
    });
}
exports.Lazy = Lazy;
function Contract() {
    var runtypes = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        runtypes[_i] = arguments[_i];
    }
    var lastIndex = runtypes.length - 1;
    var argTypes = runtypes.slice(0, lastIndex);
    var returnType = runtypes[lastIndex];
    return {
        enforce: function (f) { return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (args.length < argTypes.length)
                throw new ValidationError("Expected " + argTypes.length + " arguments but only received " + args.length);
            for (var i = 0; i < argTypes.length; i++)
                argTypes[i].check(args[i]);
            return returnType.check(f.apply(void 0, args));
        }; }
    };
}
exports.Contract = Contract;
function runtype(check) {
    var A = {
        check: check,
        validate: validate,
        guard: guard,
        Or: Or,
        And: And,
        withConstraint: withConstraint,
        _falseWitness: undefined,
    };
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
        return Union(A, B);
    }
    function And(B) {
        return Intersect(A, B);
    }
    function withConstraint(constraint) {
        return runtype(function (x) {
            var typed = check(x);
            var result = constraint(typed);
            if (exports.String.guard(result))
                throw new ValidationError(result);
            else if (!result)
                throw new ValidationError('Failed constraint check');
            return typed;
        });
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
