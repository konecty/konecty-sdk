"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Document = void 0;

require("reflect-metadata");

function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }

var id = 0;

function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }

var _config = /*#__PURE__*/_classPrivateFieldLooseKey("config");

class Document {
  constructor(config) {
    Object.defineProperty(this, _config, {
      writable: true,
      value: void 0
    });
    this._id = void 0;
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
  }

  get config() {
    return _classPrivateFieldLooseBase(this, _config)[_config];
  }

  getType(propertyKey) {
    return Reflect.getMetadata('type', this, propertyKey);
  }

}

exports.Document = Document;