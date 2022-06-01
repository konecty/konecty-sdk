"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createTypeFromMetadata = createTypeFromMetadata;

var _camelCase = _interopRequireDefault(require("lodash/camelCase"));

var _startCase = _interopRequireDefault(require("lodash/startCase"));

var _prettier = _interopRequireDefault(require("prettier"));

var _types = require("../sdk/types");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const pascalCase = str => (0, _startCase.default)((0, _camelCase.default)(str)).replace(/ /g, '');

function createTypeFromMetadata(metadata) {
  const {
    name,
    collection,
    label,
    plurals,
    fields
  } = metadata;
  const imports = {
    TypeUtils: ['PickFromPath'],
    Konecty: [],
    Documents: []
  };
  const documentConfig = [`const ${(0, _camelCase.default)(name)}Config: DocumentConfig = {`, `name: '${name}',`, `collection: '${collection ?? `data.${name}`}',`];

  if (label != null) {
    documentConfig.push('label: {');
    Object.keys(label).forEach(key => {
      documentConfig.push(`${key}: '${label[key]}',`);
    });
    documentConfig.push('},');
  }

  if (plurals != null) {
    documentConfig.push('plurals: {');
    Object.keys(plurals).forEach(key => {
      documentConfig.push(`${key}: '${plurals[key]}',`);
    });
    documentConfig.push('},');
  }

  documentConfig.push(`};`);
  Object.values(fields).map(({
    document
  }) => document).filter(d => d).forEach(document => {
    imports.Documents.push(document);
  });
  const lookupTypes = Object.values(fields).filter(field => field.type === _types.FieldType.lookup).map(field => `export type ${name}${pascalCase(field.name)}Type = PickFromPath<${field.document}, '${(field.descriptionFields ?? []).join(`' | '`)}'>;`);
  const pickListTypes = Object.values(fields).filter(field => field.type === _types.FieldType.picklist).filter(({
    options
  }) => options != null).map(field => `export type ${name}${pascalCase(field.name)}Type = '${Object.keys(field.options ?? {}).join(`' | '`)}';`);

  function getBaseType(field) {
    switch (field.type) {
      case _types.FieldType.url:
      case _types.FieldType.ObjectId:
      case _types.FieldType.encrypted:
      case _types.FieldType.richText:
        return 'string';

      case _types.FieldType.number:
      case _types.FieldType.autoNumber:
      case _types.FieldType.percentage:
        return 'number';

      case _types.FieldType.date:
      case _types.FieldType.dateTime:
        return 'Date';

      case _types.FieldType.picklist:
        return `${name}${pascalCase(field.name)}Type`;

      case _types.FieldType.email:
        imports.Konecty.push('Email');
        return 'Email';

      case _types.FieldType.money:
        imports.Konecty.push('Money');
        return 'Money';

      case _types.FieldType.boolean:
        return 'boolean';

      case _types.FieldType.address:
        imports.Konecty.push('Address');
        return 'Address';

      case _types.FieldType.personName:
        imports.Konecty.push('PersonName');
        return 'PersonName';

      case _types.FieldType.phone:
        imports.Konecty.push('Phone');
        return 'Phone';

      case _types.FieldType.lookup:
        return `${name}${pascalCase(field.name)}Type`;

      case _types.FieldType.filter:
        imports.Konecty.push('Filter');
        return `Filter<${field.document}>`;

      case _types.FieldType.file:
        imports.Konecty.push('FileDescriptor');
        return 'FileDescriptor';

      case _types.FieldType.JSON:
        return 'object';

      default:
        return 'string';
    }
  }

  function getListIndicatorForType(field) {
    if (field.isList) {
      return '[]';
    }

    return '';
  }

  const interfaceProperties = Object.values(fields).map(field => `${field.name}: ${getBaseType(field)}${getListIndicatorForType(field)};`);
  const classProperties = Object.values(fields).reduce((acc, field) => {
    return acc.concat([`readonly ${field.name}:MetadataField<${getBaseType(field)}> = ${JSON.stringify(field)} as MetadataField<${getBaseType(field)}>;`]);
  }, []);
  Object.values(fields).map(field => `${field.name}: ${getBaseType(field)};`);
  const code = [`import { ${imports.TypeUtils.join(', ')} } from '@konecty/sdk/TypeUtils';`, `import { Document, DocumentConfig, KonectyDocument } from '@konecty/sdk/Module'`, `import { MetadataField } from 'types/metadata';`].concat(`import { ${Array.from(new Set(imports.Konecty)).sort().join(', ')} } from '@konecty/sdk/types';`).concat(Array.from(new Set(imports.Documents)).filter(d => d !== name).sort().map(document => `import { ${document} } from './${document}';`)).concat(documentConfig).concat(lookupTypes).concat(pickListTypes).concat(`export interface ${name} extends KonectyDocument {`).concat(interfaceProperties).concat(`}`).concat(`export class ${name}Module extends Document<${name}> {`).concat(`constructor() {super(${(0, _camelCase.default)(name)}Config);}`).concat(classProperties).concat(`}`).join('\n');

  const formatedCode = _prettier.default.format(code, {
    parser: 'typescript',
    singleQuote: true,
    semi: true,
    trailingComma: 'all',
    useTabs: true,
    tabWidth: 4,
    printWidth: 132,
    bracketSpacing: true,
    arrowParens: 'avoid'
  });

  return formatedCode;
}