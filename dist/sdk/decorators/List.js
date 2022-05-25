"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.List = List;

function List(target, propertyKey, descriptor) {
  descriptor.isList = false;
  descriptor.enumerable = false;
}