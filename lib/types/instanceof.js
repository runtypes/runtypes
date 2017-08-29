"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
function InstanceOf(ctor) {
    return runtype_1.create(function (x) {
        if (!(x instanceof ctor)) {
            throw runtype_1.validationError("Expected a " + ctor.name + " but was " + typeof x);
        }
        return x;
    }, { tag: "instanceof", ctor: ctor });
}
exports.InstanceOf = InstanceOf;
