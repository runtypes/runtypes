"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var show = function (needsParens) { return function (refl) {
    var parenthesize = function (s) { return needsParens ? "(" + s + ")" : s; };
    switch (refl.tag) {
        // Primitive types
        case 'always':
        case 'never':
        case 'void':
        case 'boolean':
        case 'number':
        case 'string':
        case 'function':
            return refl.tag;
        // Complex types
        case 'literal': {
            var value = refl.value;
            return typeof value === 'string'
                ? "\"" + value + "\""
                : String(value);
        }
        case 'array':
            return show(true)(refl.element) + "[]";
        case 'dictionary':
            return "{ [_: " + refl.key + "]: " + show(false)(refl.value) + " }";
        case 'record': {
            var keys = Object.keys(refl.fields);
            return keys.length ? "{ " + keys
                .map(function (k) { return k + ": " + show(false)(refl.fields[k]) + ";"; })
                .join(' ') + " }" : '{}';
        }
        case 'partial': {
            var keys = Object.keys(refl.fields);
            return keys.length ? "{ " + keys
                .map(function (k) { return k + "?: " + show(false)(refl.fields[k]) + ";"; })
                .join(' ') + " }" : '{}';
        }
        case 'tuple':
            return "[" + refl.components.map(show(false)).join(', ') + "]";
        case 'union':
            return parenthesize("" + refl.alternatives.map(show(true)).join(' | '));
        case 'intersect':
            return parenthesize("" + refl.intersectees.map(show(true)).join(' & '));
        case 'constraint':
            return show(needsParens)(refl.underlying);
        case 'instanceof':
            var name_1 = refl.ctor.name;
            return "InstanceOf<" + (name_1) + ">";
    }
}; };
exports.default = show(false);
