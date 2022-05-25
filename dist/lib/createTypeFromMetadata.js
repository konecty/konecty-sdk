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
    FieldTypes: [],
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
  const lookupTypes = Object.values(fields).filter(field => field.type === _types.FieldType.lookup).map(field => `export type ${name}${pascalCase(field.name)}Type = PickFromPath<${field.document}, '${field.descriptionFields.join(`' | '`)}'>;`);
  const pickListTypes = Object.values(fields).filter(field => field.type === _types.FieldType.picklist).filter(({
    options
  }) => options != null).map(field => `export type ${name}${pascalCase(field.name)}Type = '${Object.keys(field.options ?? {}).join(`' | '`)}';`);
  const pickListOptions = Object.values(fields).filter(field => field.type === _types.FieldType.picklist).filter(({
    options
  }) => options != null).map(field => `const ${(0, _camelCase.default)(field.name)}Options: FieldOptions = ${JSON.stringify(field.options ?? {})} as FieldOptions;`); // return `@PicklistField({ options: ${camelCase(field.name)}Type )`;

  function getTypeDecorator(field) {
    switch (field.type) {
      case _types.FieldType.url:
        imports.FieldTypes.push('UrlField');
        return '@UrlField';

      case _types.FieldType.email:
        imports.FieldTypes.push('EmailField');
        return '@EmailField';

      case _types.FieldType.number:
        imports.FieldTypes.push('NumberField');
        return '@NumberField';

      case _types.FieldType.autoNumber:
        imports.FieldTypes.push('AutoNumberField');
        return '@AutoNumberField';

      case _types.FieldType.date:
        imports.FieldTypes.push('DateField');
        return '@DateField';

      case _types.FieldType.dateTime:
        imports.FieldTypes.push('DateTimeField');
        return '@DateTimeField';

      case _types.FieldType.money:
        imports.FieldTypes.push('MoneyField');
        return '@MoneyField';

      case _types.FieldType.boolean:
        imports.FieldTypes.push('BooleanField');
        return '@BooleanField';

      case _types.FieldType.address:
        imports.FieldTypes.push('AddressField');
        return '@AddressField';

      case _types.FieldType.personName:
        imports.FieldTypes.push('PersonNameField');
        return '@PersonNameField';

      case _types.FieldType.phone:
        imports.FieldTypes.push('PhoneField');
        return '@PhoneField';

      case _types.FieldType.picklist:
        imports.FieldTypes.push('PicklistField');
        return `@PicklistField({ options: ${(0, _camelCase.default)(field.name)}Options })`;

      case _types.FieldType.lookup:
        imports.FieldTypes.push('LookupField');
        return `@LookupField<${field.document}>({ document: new ${field.document}()${field.descriptionFields != null ? `, descriptionFields: ['${field.descriptionFields.join(`', '`)}']` : ''}${field.inheritedFields != null ? `, inheritedFields: ['${field.inheritedFields.map(({
          fieldName
        }) => fieldName).join(`', '`)}']` : ''} })`;

      case _types.FieldType.ObjectId:
        imports.FieldTypes.push('ObjectIdField');
        return '@ObjectIdField';

      case _types.FieldType.encrypted:
        imports.FieldTypes.push('EncryptedField');
        return '@EncryptedField';

      case _types.FieldType.filter:
        imports.FieldTypes.push('FilterField');
        return '@FilterField';

      case _types.FieldType.richText:
        imports.FieldTypes.push('RichTextField');
        return '@RichTextField';

      case _types.FieldType.file:
        imports.FieldTypes.push('FileField');
        return '@FileField';

      case _types.FieldType.percentage:
        imports.FieldTypes.push('PercentageField');
        return '@PercentageField';

      case _types.FieldType.JSON:
        imports.FieldTypes.push('JSONField');
        return '@JSONField';

      default:
        imports.FieldTypes.push('TextField');
        return '@TextField';
    }
  }

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
        imports.Konecty.push('FieldOptions');
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
    return acc.concat([`${getTypeDecorator(field)}`, `${field.name}!: ${getBaseType(field)}${getListIndicatorForType(field)};`]);
  }, []);
  Object.values(fields).map(field => `${field.name}: ${getBaseType(field)};`);
  const code = [`import { ${imports.TypeUtils.join(', ')} } from '@konecty/sdk/TypeUtils';`, `import { Document, DocumentConfig, KonectyDocument } from '@konecty/sdk/Document'`].concat(`import { ${Array.from(new Set(imports.Konecty)).sort().join(', ')} } from '@konecty/sdk/types';`).concat(`import { ${Array.from(new Set(imports.FieldTypes)).sort().join(', ')} } from '@konecty/sdk/decorators/FieldTypes';`).concat(Array.from(new Set(imports.Documents)).filter(d => d !== name).sort().map(document => `import { ${document} } from './${document}';`)).concat(documentConfig).concat(lookupTypes).concat(pickListTypes).concat(pickListOptions).concat(`export interface ${name}Type extends KonectyDocument {`).concat(interfaceProperties).concat(`}`).concat(`export class ${name} extends Document<${name}Type> implements ${name}Type {`).concat(`constructor(data?: ${name}Type) {super(${(0, _camelCase.default)(name)}Config, data);}`).concat(classProperties).concat(`}`).join('\n');

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