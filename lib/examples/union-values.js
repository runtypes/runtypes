"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../index");
// Define the runtype
var Day = index_1.Union(index_1.Literal('Sunday'), index_1.Literal('Monday'), index_1.Literal('Tuesday'), index_1.Literal('Wednesday'), index_1.Literal('Thursday'), index_1.Literal('Friday'), index_1.Literal('Saturday'));
// Extract enumerated literal values
var days = Day.alternatives.map(function (lit) { return lit.value; });
for (var _i = 0, days_1 = days; _i < days_1.length; _i++) {
    var day = days_1[_i];
    console.log("Good morning, it's " + day + "!");
}
