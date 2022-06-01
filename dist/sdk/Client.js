"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.KonectyClient = void 0;

var _get = _interopRequireDefault(require("lodash/get"));

var _undici = require("undici");

var _logger = _interopRequireDefault(require("../lib/logger"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class KonectyClient {
  constructor(options) {
    this._options = void 0;

    if (options != null) {
      this._options = options;
      return;
    }

    this._options = KonectyClient.defaults;
  }

  async find(module, options) {
    try {
      const params = new URLSearchParams();
      Object.keys(options).forEach(key => {
        params.set(key, JSON.stringify((0, _get.default)(options, key)));
      });
      const result = await (0, _undici.fetch)(`${this._options.endpoint}/rest/data/${module}/find?${params.toString()}`, {
        method: 'GET',
        headers: {
          Authorization: `${this._options.accessKey}`
        }
      });
      const body = await result.json();
      return body;
    } catch (err) {
      _logger.default.error(err);

      return {
        success: false,
        errors: [err.message]
      };
    }
  }

}

exports.KonectyClient = KonectyClient;
KonectyClient.defaults = {};