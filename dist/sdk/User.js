"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserModule = void 0;

var _Module = require("./Module");

const userConfig = {
  name: 'User',
  collection: 'users',
  label: {
    en: 'User',
    pt_BR: 'Usuário'
  },
  plurals: {
    en: 'Users',
    pt_BR: 'Usuários'
  }
};

class UserModule extends _Module.KonectyModule {
  constructor(clientOptions) {
    super(userConfig, clientOptions);
    this.code = {
      type: 'autoNumber',
      name: 'code',
      label: {
        en: 'Code',
        pt_BR: 'Código'
      },
      isUnique: true,
      isSortable: true,
      isInherited: true
    };
    this.username = {
      isRequired: true,
      isSortable: true,
      isUnique: true,
      label: {
        pt_BR: 'Login',
        en: 'Login'
      },
      name: 'username',
      normalization: 'lower',
      type: 'text',
      isInherited: true
    };
    this.emails = {
      isList: true,
      isSortable: true,
      label: {
        en: 'Email',
        pt_BR: 'Email'
      },
      name: 'emails',
      type: 'email',
      isInherited: true
    };
    this.name = {
      label: {
        en: 'Name',
        pt_BR: 'Nome'
      },
      isSortable: true,
      normalization: 'title',
      type: 'text',
      name: 'name',
      isInherited: true
    };
    this.group = {
      label: {
        en: 'Group',
        pt_BR: 'Grupo'
      },
      isRequired: true,
      isSortable: true,
      document: 'Group',
      descriptionFields: ['name'],
      type: 'lookup',
      name: 'group',
      isInherited: true,
      inheritedFields: [{
        fieldName: 'office',
        inherit: 'always'
      }, {
        fieldName: 'director',
        inherit: 'always'
      }, {
        fieldName: 'extension',
        inherit: 'until_edited'
      }]
    };
    this.groups = {
      type: 'lookup',
      name: 'groups',
      label: {
        en: 'Extra Access Groups',
        pt_BR: 'Grupos de Acesso Extra'
      },
      isSortable: true,
      isList: true,
      document: 'Group',
      descriptionFields: ['name'],
      isInherited: true
    };
    this.admin = {
      type: 'boolean',
      name: 'admin',
      label: {
        en: 'Administrator',
        pt_BR: 'Administrador'
      },
      isInherited: true
    };
    this.active = {
      defaultValue: true,
      type: 'boolean',
      name: 'active',
      label: {
        en: 'Active',
        pt_BR: 'Ativo'
      },
      isRequired: true,
      isSortable: true,
      isInherited: true
    };
  } // #region base properties
  //#endregion


}

exports.UserModule = UserModule;