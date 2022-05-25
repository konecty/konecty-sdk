#!/usr/bin/env node
"use strict";

var _createProgram = _interopRequireDefault(require("./createProgram"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const program = (0, _createProgram.default)();
program.parse(process.argv);