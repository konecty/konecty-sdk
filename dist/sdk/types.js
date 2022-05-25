"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FieldType = void 0;
let FieldType;
exports.FieldType = FieldType;

(function (FieldType) {
  FieldType["text"] = "text";
  FieldType["url"] = "url";
  FieldType["email"] = "email";
  FieldType["number"] = "number";
  FieldType["autoNumber"] = "autoNumber";
  FieldType["date"] = "date";
  FieldType["dateTime"] = "dateTime";
  FieldType["money"] = "money";
  FieldType["boolean"] = "boolean";
  FieldType["address"] = "address";
  FieldType["personName"] = "personName";
  FieldType["phone"] = "phone";
  FieldType["picklist"] = "picklist";
  FieldType["lookup"] = "lookup";
  FieldType["ObjectId"] = "ObjectId";
  FieldType["encrypted"] = "encrypted";
  FieldType["filter"] = "filter";
  FieldType["richText"] = "richText";
  FieldType["file"] = "file";
  FieldType["percentage"] = "percentage";
  FieldType["JSON"] = "json";
})(FieldType || (exports.FieldType = FieldType = {}));