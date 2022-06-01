"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.KonectyModule = void 0;

var _Client = require("@konecty/sdk/Client");

require("reflect-metadata");

function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }

var id = 0;

function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }

var _config = /*#__PURE__*/_classPrivateFieldLooseKey("config");

var _client = /*#__PURE__*/_classPrivateFieldLooseKey("client");

class KonectyModule {
  constructor(config, clientOptons) {
    Object.defineProperty(this, _config, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, _client, {
      writable: true,
      value: void 0
    });
    this._id = {
      label: {
        en: 'Unique Identifier',
        pt_BR: 'Identificador'
      },
      isSortable: true,
      type: 'ObjectId',
      name: '_id',
      isInherited: true
    };
    this._user = {
      descriptionFields: ['name', 'group.name', 'active'],
      detailFields: ['phone', 'emails'],
      type: 'lookup',
      name: '_user',
      label: {
        en: 'User',
        pt_BR: 'Usuário'
      },
      isSortable: true,
      isList: true,
      document: 'User',
      isInherited: true
    };
    this._createdAt = {
      label: {
        en: 'Created At',
        pt_BR: 'Criado em'
      },
      isSortable: true,
      type: 'dateTime',
      name: '_createdAt',
      isInherited: true
    };
    this._createdBy = {
      type: 'lookup',
      name: '_createdBy',
      label: {
        en: 'Created by',
        pt_BR: 'Criado por'
      },
      isSortable: true,
      document: 'User',
      descriptionFields: ['name', 'group.name'],
      isInherited: true
    };
    this._updatedAt = {
      type: 'dateTime',
      name: '_updatedAt',
      label: {
        pt_BR: 'Atualizado em',
        en: 'Updated At'
      },
      isSortable: true,
      isInherited: true
    };
    this._updatedBy = {
      label: {
        en: 'Updated by',
        pt_BR: 'Atualizado por'
      },
      document: 'User',
      descriptionFields: ['name', 'group.name'],
      type: 'lookup',
      name: '_updatedBy',
      isInherited: true
    };
    _classPrivateFieldLooseBase(this, _config)[_config] = config;
    _classPrivateFieldLooseBase(this, _client)[_client] = new _Client.KonectyClient(clientOptons);
  }

  async findOne(filter) {
    const result = await _classPrivateFieldLooseBase(this, _client)[_client].find(_classPrivateFieldLooseBase(this, _config)[_config].name, {
      filter,
      limit: 1
    });

    if (result?.success === true && result.data?.length === 1) {
      return result.data[0];
    }

    throw new Error(result.errors?.join('\n') ?? 'Unknown error');
  }

  async find(filter, options) {
    const result = await _classPrivateFieldLooseBase(this, _client)[_client].find(_classPrivateFieldLooseBase(this, _config)[_config].name, Object.assign({}, {
      filter,
      start: 0,
      limit: 50
    }, options ?? {}));

    if (result?.success === true) {
      return {
        data: result.data,
        count: result.total
      };
    }

    throw new Error(result.errors?.join('\n') ?? 'Unknown error');
  } // #region commom properties
  // #endregion


}

exports.KonectyModule = KonectyModule;