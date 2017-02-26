"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
/**
 * Construct a possibly-recursive Runtype.
 */
function Lazy(delayed) {
    var data = {
        get tag() { return getWrapped()['tag']; }
    };
    var cached;
    function getWrapped() {
        if (!cached) {
            cached = delayed();
            for (var k in cached)
                if (k !== 'tag')
                    data[k] = cached[k];
        }
        return cached;
    }
    return runtype_1.create(function (x) {
        return getWrapped().check(x);
    }, data);
}
exports.Lazy = Lazy;
