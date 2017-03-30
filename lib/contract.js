"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("./runtype");
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
                throw runtype_1.validationError("Expected " + argTypes.length + " arguments but only received " + args.length);
            for (var i = 0; i < argTypes.length; i++)
                argTypes[i].check(args[i]);
            return returnType.check(f.apply(void 0, args));
        }; }
    };
}
exports.Contract = Contract;
