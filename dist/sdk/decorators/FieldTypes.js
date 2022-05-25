"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AddressField = AddressField;
exports.AutoNumberField = AutoNumberField;
exports.BooleanField = BooleanField;
exports.DateField = DateField;
exports.DateTimeField = DateTimeField;
exports.EmailField = EmailField;
exports.EncryptedField = EncryptedField;
exports.FileField = FileField;
exports.FilterField = FilterField;
exports.JSONField = JSONField;
exports.LookupField = LookupField;
exports.MoneyField = MoneyField;
exports.NumberField = NumberField;
exports.ObjectIdField = ObjectIdField;
exports.PercentageField = PercentageField;
exports.PersonNameField = PersonNameField;
exports.PhoneField = PhoneField;
exports.PicklistField = PicklistField;
exports.RichTextField = RichTextField;
exports.TextField = TextField;
exports.UrlField = UrlField;

require("reflect-metadata");

var _types = require("../types");

function ObjectIdField(target, propertyKey) {
  Reflect.defineMetadata('type', _types.FieldType.ObjectId, target, propertyKey);
}

function AutoNumberField(target, propertyKey) {
  Reflect.defineMetadata('type', _types.FieldType.autoNumber, target, propertyKey);
}

function TextField(target, propertyKey) {
  Reflect.defineMetadata('type', _types.FieldType.text, target, propertyKey);
}

function UrlField(target, propertyKey) {
  Reflect.defineMetadata('type', _types.FieldType.url, target, propertyKey);
}

function EmailField(target, propertyKey) {
  Reflect.defineMetadata('type', _types.FieldType.email, target, propertyKey);
}

function NumberField(target, propertyKey) {
  Reflect.defineMetadata('type', _types.FieldType.number, target, propertyKey);
}

function DateField(target, propertyKey) {
  Reflect.defineMetadata('type', _types.FieldType.date, target, propertyKey);
}

function DateTimeField(target, propertyKey) {
  Reflect.defineMetadata('type', _types.FieldType.dateTime, target, propertyKey);
}

function MoneyField(target, propertyKey) {
  Reflect.defineMetadata('type', _types.FieldType.money, target, propertyKey);
}

function BooleanField(target, propertyKey) {
  Reflect.defineMetadata('type', _types.FieldType.boolean, target, propertyKey);
}

function AddressField(target, propertyKey) {
  Reflect.defineMetadata('type', _types.FieldType.address, target, propertyKey);
}

function PersonNameField(target, propertyKey) {
  Reflect.defineMetadata('type', _types.FieldType.personName, target, propertyKey);
}

function PhoneField(target, propertyKey) {
  Reflect.defineMetadata('type', _types.FieldType.phone, target, propertyKey);
}

function PicklistField(options) {
  return function (target, propertyKey) {
    Reflect.defineMetadata('type', _types.FieldType.picklist, target, propertyKey);
    Reflect.defineMetadata('options', options, target, propertyKey);
  };
}

function LookupField({
  document,
  descriptionFields,
  inheritedFields
}) {
  // type LookupDescriptionKeyType = typeof descriptionFields[number];
  // type LookupDescriptionType = Partial<Pick<T, LookupDescriptionKeyType>>;
  return function (target, propertyKey) {
    Reflect.defineMetadata('type', _types.FieldType.lookup, target, propertyKey);
    Reflect.defineMetadata('document', document, target, propertyKey);
    Reflect.defineMetadata('descriptionFields', descriptionFields, target, propertyKey);
    Reflect.defineMetadata('inheritedFields', inheritedFields, target, propertyKey);
  };
}

function EncryptedField(target, propertyKey) {
  Reflect.defineMetadata('type', _types.FieldType.date, target, propertyKey);
}

function FilterField(target, propertyKey) {
  Reflect.defineMetadata('type', _types.FieldType.filter, target, propertyKey);
}

function RichTextField(target, propertyKey) {
  Reflect.defineMetadata('type', _types.FieldType.richText, target, propertyKey);
}

function FileField(target, propertyKey) {
  Reflect.defineMetadata('type', _types.FieldType.file, target, propertyKey);
}

function PercentageField(target, propertyKey) {
  Reflect.defineMetadata('type', _types.FieldType.percentage, target, propertyKey);
}

function JSONField(target, propertyKey) {
  Reflect.defineMetadata('type', _types.FieldType.JSON, target, propertyKey);
}