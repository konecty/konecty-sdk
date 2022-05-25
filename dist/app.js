"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fastify = _interopRequireDefault(require("fastify"));

var _logger = _interopRequireDefault(require("./lib/logger"));

var _hello = _interopRequireDefault(require("./routes/hello"));

var _liveness = _interopRequireDefault(require("./routes/liveness"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createServer() {
  const server = (0, _fastify.default)({
    logger: _logger.default
  });
  server.register(_hello.default);
  server.register(_liveness.default);
  return server;
}

var _default = createServer;
exports.default = _default;