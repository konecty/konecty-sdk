"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GroupModule = void 0;

var _Module = require("./Module");

const groupConfig = {
  name: 'Group',
  collection: 'data.Group',
  label: {
    en: 'Group',
    pt_BR: 'Grupo'
  },
  plurals: {
    en: 'Groups',
    pt_BR: 'Grupos'
  }
};

class GroupModule extends _Module.KonectyModule {
  constructor() {
    super(groupConfig);
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
  }

}

exports.GroupModule = GroupModule;