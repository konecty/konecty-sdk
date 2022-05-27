import camelCase from 'lodash/camelCase';
import startCase from 'lodash/startCase';
import prettier from 'prettier';
import { MetadataDocument, MetadataField } from 'types/metadata';
import { FieldType } from '../sdk/types';

const pascalCase = (str: string) => startCase(camelCase(str)).replace(/ /g, '');

export function createTypeFromMetadata(metadata: MetadataDocument): string {
	const { name, collection, label, plurals, fields } = metadata;

	const imports: { [key: string]: string[] } = {
		TypeUtils: ['PickFromPath'],
		Konecty: [],
		Documents: [],
	};
	const documentConfig = [
		`const ${camelCase(name)}Config: DocumentConfig = {`,
		`name: '${name}',`,
		`collection: '${collection ?? `data.${name}`}',`,
	];

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

	Object.values<MetadataField<unknown>>(fields)
		.map(({ document }) => document)
		.filter(d => d)
		.forEach(document => {
			imports.Documents.push(document as string);
		});

	const lookupTypes = Object.values<MetadataField>(fields)
		.filter(field => field.type === FieldType.lookup)
		.map(
			field =>
				`export type ${name}${pascalCase(field.name)}Type = PickFromPath<${field.document}, '${(
					field.descriptionFields ?? []
				).join(`' | '`)}'>;`,
		);

	const pickListTypes: string[] = Object.values<MetadataField>(fields)
		.filter(field => field.type === FieldType.picklist)
		.filter(({ options }) => options != null)
		.map(field => `export type ${name}${pascalCase(field.name)}Type = '${Object.keys(field.options ?? {}).join(`' | '`)}';`);

	function getBaseType(field: MetadataField): string {
		switch (field.type) {
			case FieldType.url:

			case FieldType.ObjectId:
			case FieldType.encrypted:
			case FieldType.richText:
				return 'string';

			case FieldType.number:
			case FieldType.autoNumber:
			case FieldType.percentage:
				return 'number';

			case FieldType.date:
			case FieldType.dateTime:
				return 'Date';
			case FieldType.picklist:
				return `${name}${pascalCase(field.name)}Type`;
			case FieldType.email:
				imports.Konecty.push('Email');
				return 'Email';
			case FieldType.money:
				imports.Konecty.push('Money');
				return 'Money';
			case FieldType.boolean:
				return 'boolean';
			case FieldType.address:
				imports.Konecty.push('Address');
				return 'Address';
			case FieldType.personName:
				imports.Konecty.push('PersonName');
				return 'PersonName';
			case FieldType.phone:
				imports.Konecty.push('Phone');
				return 'Phone';

			case FieldType.lookup:
				return `${name}${pascalCase(field.name)}Type`;

			case FieldType.filter:
				imports.Konecty.push('Filter');

				return `Filter<${field.document}>`;

			case FieldType.file:
				imports.Konecty.push('FileDescriptor');
				return 'FileDescriptor';

			case FieldType.JSON:
				return 'object';
			default:
				return 'string';
		}
	}

	function getListIndicatorForType(field: MetadataField): string {
		if (field.isList) {
			return '[]';
		}
		return '';
	}

	const interfaceProperties: string[] = Object.values<MetadataField>(fields).map(
		field => `${field.name}: ${getBaseType(field)}${getListIndicatorForType(field)};`,
	);

	const classProperties: string[] = Object.values<MetadataField>(fields).reduce<string[]>((acc, field) => {
		return acc.concat([
			`readonly ${field.name}:MetadataField<${getBaseType(field)}> = ${JSON.stringify(field)} as MetadataField<${getBaseType(
				field,
			)}>;`,
		]);
	}, []);

	Object.values<MetadataField>(fields).map(field => `${field.name}: ${getBaseType(field)};`);

	const code = [
		`import { ${imports.TypeUtils.join(', ')} } from '@konecty/sdk/TypeUtils';`,
		`import { Document, DocumentConfig, KonectyDocument } from '@konecty/sdk/Document'`,
		`import { MetadataField } from 'types/metadata';`,
	]
		.concat(`import { ${Array.from(new Set(imports.Konecty)).sort().join(', ')} } from '@konecty/sdk/types';`)
		.concat(
			Array.from(new Set(imports.Documents))
				.filter(d => d !== name)
				.sort()
				.map(document => `import { ${document} } from './${document}';`),
		)
		.concat(documentConfig)
		.concat(lookupTypes)
		.concat(pickListTypes)
		.concat(`export interface ${name} extends KonectyDocument {`)
		.concat(interfaceProperties)
		.concat(`}`)
		.concat(`export class ${name}Module extends Document<${name}> {`)
		.concat(`constructor() {super(${camelCase(name)}Config);}`)
		.concat(classProperties)
		.concat(`}`)
		.join('\n');

	const formatedCode = prettier.format(code, {
		parser: 'typescript',
		singleQuote: true,
		semi: true,
		trailingComma: 'all',
		useTabs: true,
		tabWidth: 4,
		printWidth: 132,
		bracketSpacing: true,
		arrowParens: 'avoid',
	});

	return formatedCode;
}
