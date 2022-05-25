"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _pino = _interopRequireDefault(require("pino"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, _pino.default)({
  level: process.env.LOG_LEVEL || 'info'
});
var _default = logger;
exports.default = _default;