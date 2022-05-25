"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Document = void 0;

require("reflect-metadata");

var _FieldTypes = require("./decorators/FieldTypes");

var _User = require("./User");

var _dec, _dec2, _dec3, _class, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _config;

function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }

var id = 0;

function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }

function dec(target, key) {
  Object.defineProperty(target, key, {
    enumerable: true
  });
}

let Document = (_dec = (0, _FieldTypes.LookupField)({
  document: new _User.User(),
  descriptionFields: ['name', 'group.name', 'active']
}), _dec2 = (0, _FieldTypes.LookupField)({
  document: new _User.User(),
  descriptionFields: ['name', 'group.name', 'active']
}), _dec3 = (0, _FieldTypes.LookupField)({
  document: new _User.User(),
  descriptionFields: ['name', 'group.name', 'active']
}), (_class = (_config = /*#__PURE__*/_classPrivateFieldLooseKey("config"), class Document {
  constructor(config, data) {
    Object.defineProperty(this, _config, {
      writable: true,
      value: void 0
    });
    this._data = void 0;

    _initializerDefineProperty(this, "_id", _descriptor, this);

    _initializerDefineProperty(this, "_user", _descriptor2, this);

    _initializerDefineProperty(this, "_createdAt", _descriptor3, this);

    _initializerDefineProperty(this, "createdBy", _descriptor4, this);

    _initializerDefineProperty(this, "_updatedAt", _descriptor5, this);

    _initializerDefineProperty(this, "_updatedBy", _descriptor6, this);

    _classPrivateFieldLooseBase(this, _config)[_config] = config;
    this._data = data;
  }

  get config() {
    return _classPrivateFieldLooseBase(this, _config)[_config];
  }

  get data() {
    return this._data;
  }

  getType(propertyKey) {
    return Reflect.getMetadata('type', this, propertyKey);
  }

}), (_descriptor = _applyDecoratedDescriptor(_class.prototype, "_id", [_FieldTypes.ObjectIdField], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "_user", [_dec], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, "_createdAt", [_FieldTypes.DateTimeField], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class.prototype, "createdBy", [_dec2], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class.prototype, "_updatedAt", [_FieldTypes.DateTimeField], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class.prototype, "_updatedBy", [_dec3], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
})), _class)); // const x = new Document(
// 	{
// 		name: 'User',
// 		collection: 'users',
// 		label: {
// 			en: 'User',
// 			pt_BR: 'Usuário',
// 		},
// 		plurals: {
// 			en: 'Users',
// 			pt_BR: 'Usuários',
// 		},
// 	},
// 	{ _id: '123' },
// );
// x._id = '123';
// console.log(x._id);
// console.log(x._id.type);
// const x: Document = {
// 	_id: 'my-id',
// 	// test: ['text 1', 'text 2'],
// 	// test2: 'text 3',
// };
// console.log(x._id); // 'my-id'
// console.log(x._id.type); // FieldType.ObjectId
// const x1 = KonectyDocument.create('Document', {
// 	_id: 'my-id',
// 	test: ['text 1', 'text 2'],
// 	test2: 'text 3',
// });

exports.Document = Document;