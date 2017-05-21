"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./index");
var runtype_1 = require("./runtype");
function Contract() {
    var runtypes = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        runtypes[_i] = arguments[_i];
    }
    var lastIndex = runtypes.length - 1;
    var argTypes = runtypes.slice(0, lastIndex);
    var returnType = runtypes[lastIndex];
    var argsTuple = index_1.Tuple.apply(null, argTypes);
    var result = {
        reflect: {
            argTypes: argsTuple,
            returnType: returnType
        },
        withConstraint: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            argsTuple = argsTuple.withConstraint.apply(argsTuple, args);
            result.reflect.argTypes = argsTuple;
            return result;
        },
        enforce: function (f) { return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (args.length < argTypes.length)
                throw runtype_1.validationError("Expected " + argTypes.length + " arguments but only received " + args.length);
            argsTuple.check(args);
            return returnType.check(f.apply(void 0, args));
        }; }
    };
    return result;
}
exports.Contract = Contract;
