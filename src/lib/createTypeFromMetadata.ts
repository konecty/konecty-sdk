import { MetadataDocument, MetadataField } from '@konecty/sdk/types/metadata';
import camelCase from 'lodash/camelCase';
import set from 'lodash/set';
import startCase from 'lodash/startCase';
import prettier from 'prettier';
import { FieldType } from '../sdk/types';

const pascalCase = (str: string) => startCase(camelCase(str)).replace(/ /g, '');

export function createTypeFromMetadata(metadata: MetadataDocument): string {
	const { name, collection, label, plurals, fields } = metadata;

	const imports: { [key: string]: string[] } = {
		TypeUtils: ['PickFromPath'],
		Konecty: [],
		Documents: [],
		DocumentFilters: [],
	};

	const documentConfig = [
		`const ${camelCase(name)}Config: ModuleConfig = {`,
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
		.filter(d => !['User', 'Group'].includes(d ?? ''))
		.forEach(document => {
			imports.Documents.push(document as string);
		});

	const lookupTypes = Object.values<MetadataField>(fields)
		.filter(field => field.type === FieldType.lookup)
		.map(field => {
			const fieldName = pascalCase(field.name);
			if (['User', 'Group'].includes(field.document ?? '') || name === field.document) {
				const result = `export type ${name}${fieldName}Type = {_id: string, ${(field.descriptionFields ?? [])
					.reduce<string[]>((acc, field) => {
						if (/\./.test(field)) {
							const path = field.split('.');
							const result = set({}, path, 'unknown;');
							return acc.concat(
								`${JSON.stringify(result)
									.replace(/^\{(.*)\}$/, '$1')
									.replace(/\"/g, '')};`,
							);
						} else {
							if (fields[field] != null) {
								return acc.concat(`${field}: ${getBaseType(fields[field])};`);
							}
						}
						return acc;
					}, [])
					.join(``)}};`;

				return result;
			}

			return `export type ${name}${fieldName}Type = PickFromPath<${field.document}, '_id' | '${(
				field.descriptionFields ?? []
			).join(`' | '`)}'>;`;
		});

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
				// imports.Konecty.push('KonectyFilter');
				imports.DocumentFilters.push(field.document ?? '');

				return `ModuleFilter<${field.document}FilterConditions>`;

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
		field => `"${field.name}"?: ${getBaseType(field)}${getListIndicatorForType(field)};`,
	);

	const classProperties: string[] = Object.values<MetadataField>(fields).reduce<string[]>((acc, field) => {
		return acc.concat([
			`readonly "${field.name}":MetadataField<${getBaseType(field)}> = ${JSON.stringify(
				field,
			)} as MetadataField<${getBaseType(field)}>;`,
		]);
	}, []);

	const userTypes = [];
	if (fields._user != null) {
		userTypes.push(`${name}UserType[]`);
	} else {
		userTypes.push(`never`);
	}

	if (fields._createdAt != null) {
		userTypes.push(`${name}CreatedByType`);
	} else {
		userTypes.push(`never`);
	}

	if (fields._updatedAt != null) {
		userTypes.push(`${name}UpdatedByType`);
	} else {
		userTypes.push(`never`);
	}

	const filterConditions = Object.values<MetadataField>(fields).reduce<string[]>((acc, field) => {
		const { name, type } = field;
		if (!['email', 'address', 'personName', 'money', 'phone', 'password', 'json'].includes(type)) {
			acc.push(`| FilterConditionValue<'${name}', FieldOperators<'${type}'>, ${getBaseType(field)}>`);
		}
		if (type === 'lookup') {
			acc.push(`| FilterConditionValue<'${name}._id', FieldOperators<'lookup._id'>, ${getBaseType(field)}>`);
		}
		if (type === 'filter') {
			acc.push(`| FilterConditionValue<'${name}.conditions', FieldOperators<'filter.conditions'>, ${getBaseType(field)}>`);
		}

		if (type === 'email') {
			acc.push(`| FilterConditionValue<'${name}.address', FieldOperators<'email.address'>, string>`);
		}

		if (type === 'money') {
			acc.push(`| FilterConditionValue<'${name}.currency', FieldOperators<'filter.currency'>, string>`);
			acc.push(`| FilterConditionValue<'${name}.value', FieldOperators<'filter.value'>, number>`);
		}

		if (type === 'address') {
			acc.push(`| FilterConditionValue<'${name}.country', FieldOperators<'address.country'>, string>`);
			acc.push(`| FilterConditionValue<'${name}.state', FieldOperators<'address.state'>, string>`);
			acc.push(`| FilterConditionValue<'${name}.city', FieldOperators<'address.city'>, string>`);
			acc.push(`| FilterConditionValue<'${name}.district', FieldOperators<'address.district'>, string>`);
			acc.push(`| FilterConditionValue<'${name}.place', FieldOperators<'address.place'>, string>`);
			acc.push(`| FilterConditionValue<'${name}.number', FieldOperators<'address.number'>, string>`);
			acc.push(`| FilterConditionValue<'${name}.postalCode', FieldOperators<'address.postalCode'>, string>`);
			acc.push(`| FilterConditionValue<'${name}.complement', FieldOperators<'address.complement'>, string>`);
			acc.push(`| FilterConditionValue<'${name}.geolocation.0', FieldOperators<'address.geolocation.0'>, number>`);
			acc.push(`| FilterConditionValue<'${name}.geolocation.1', FieldOperators<'address.geolocation.1'>, number>`);
		}
		if (type === 'personName') {
			acc.push(`| FilterConditionValue<'${name}.first', FieldOperators<'personName.first'>, string>`);
			acc.push(`| FilterConditionValue<'${name}.last', FieldOperators<'personName.last'>, string>`);
			acc.push(`| FilterConditionValue<'${name}.full', FieldOperators<'personName.full'>, string>`);
		}
		if (type === 'phone') {
			acc.push(`| FilterConditionValue<'${name}.phoneNumber', FieldOperators<'phone.phoneNumber'>, string>`);
			acc.push(`| FilterConditionValue<'${name}.countryCode', FieldOperators<'phone.countryCode'>, string>`);
		}

		return acc;
	}, []);

	const sortableFields = Object.values<MetadataField>(fields)
		.filter(({ isSortable }) => isSortable === true)
		.map<string>(({ name }) => `| '${name}'`);

	const filterImports = Array.from(new Set(imports.DocumentFilters));

	const code = [
		`import { ${imports.TypeUtils.join(', ')} } from '@konecty/sdk/TypeUtils';`,
		`import { KonectyModule, ModuleConfig, KonectyDocument, FilterConditionValue, FilterConditions, ModuleFilter } from '@konecty/sdk/Module'`,
		`import { MetadataField } from '@konecty/sdk/types/metadata';`,
		`import { KonectyClientOptions } from '@konecty/sdk/Client';`,
		`import { FieldOperators } from '@konecty/sdk/FieldOperators';`,
	]
		.concat(`import { ${Array.from(new Set(imports.Konecty)).sort().join(', ')} } from '@konecty/sdk/types';`)
		.concat(
			Array.from(new Set(imports.Documents))
				.filter(d => d !== name)
				.sort()
				.map(
					document =>
						`import { ${document} ${
							filterImports.includes(document) ? `, ${document}FilterConditions` : ''
						}} from './${document}';`,
				),
		)
		.concat(
			filterImports
				.filter(d => !imports.Documents.includes(d))
				.map(document => `import { ${document}FilterConditions } from './${document}';`),
		)
		.concat(documentConfig)
		.concat(lookupTypes)
		.concat(pickListTypes)
		.concat(`export interface ${name} extends KonectyDocument${userTypes.length > 0 ? `<${userTypes.join(', ')}>` : ''} {`)
		.concat(interfaceProperties)
		.concat(`}`)
		.concat(`export type ${name}FilterConditions =`)
		.concat(`| FilterConditions`)
		.concat(filterConditions)
		.concat(`export type ${name}SortFields =`)
		.concat(sortableFields)
		.concat(
			`export class ${name}Module extends KonectyModule<${name}, ${name}FilterConditions, ${name}SortFields${
				userTypes.length > 0 ? `, ${userTypes.join(', ')}` : ''
			}> {`,
		)
		.concat(`constructor(clientOptions?: KonectyClientOptions) {super(${camelCase(name)}Config, clientOptions);}`)
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
