"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.KonectyClient = void 0;

class KonectyClient {
  constructor(options) {
    this._options = void 0;

    if (options != null) {
      this._options = options;
      return;
    }

    this._options = KonectyClient.defaults;
  }

}

exports.KonectyClient = KonectyClient;
KonectyClient.defaults = void 0;