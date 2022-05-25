import get from 'lodash/get';
import { MetadataDocument, MetadataField } from 'types/metadata';
import YAML from 'yaml';

export function createDocFromMetadata(metadata: MetadataDocument): string {
	const result: string[] = [];

	result.push(`# ${metadata._id}\n`);

	function getValue(data: unknown, k: string) {
		const value = get(data, k);
		if (value == null) {
			return '';
		}
		if (typeof value === 'string') {
			return value;
		}
		if (typeof value === 'object') {
			const doc = new YAML.Document();
			doc.contents = value;
			const yamlResult = doc.toString();
			return `<pre lang="yaml">${yamlResult.replace(/\n/g, '<br>')}</pre>`;
		}
		return JSON.stringify(value);
	}

	result.push('| Config | Value |');
	result.push('| ------ | ----- |');

	Object.keys(metadata)
		.filter(p => !['_id', 'fields'].includes(p))
		.forEach(k => {
			result.push(`| \`${k}\` | ${getValue(metadata, k)} |`);
		});

	result.push('## Fields\n');

	const extraFieldKeys: string[] = [
		'size',
		'decimalSize',
		'minSelected',
		'maxSelected',
		'optionsSorter',
		'defaultValue',
		'document',
		'descriptionFields',
		'detailFields',
		'inheritedFields',
		'wildcard',
		'maxSize',
		'isUnique',
		'isSortable',
		'access',
		'bits',
		'columns',
		'comments',
		'objectRefId',
		'compositeType',
		'conditionFields',
		'decimalSize',
		'defaultValues',
		'description',
		'filterOnly',
		'filterableFields',
		'help',
		'isInherited',
		'linkedFormName',
		'minItems',
		'maxItems',
		'maxLength',
		'minValue',
		'maxValue',
		'normalization',
		'readOnlyVersion',
		'relations',
		'renderAs',
		'isTypeOptionsEditable',
		'isListTypeOptionsEditable',
		'typeOptions',
	];

	result.push('| key | label | type | required | list | options | other |');
	result.push('| --- | ----- | ---- | -------- | ---- | ------- | ----- |');

	Object.keys(metadata.fields).forEach(k => {
		const field = get(metadata.fields, k) as MetadataField;
		const line = [
			`\`${k}\``,
			field.label == null ? '' : getValue(field, 'label'),
			`\`${field.type}\``,
			`\`${field.isRequired ?? 'false'}\``,
			`\`${field.isList ?? 'false'}\``,
			field.options == null ? '' : getValue(field, 'options'),
			extraFieldKeys
				.reduce<string[]>((acc, key) => {
					if (get(field, key) != null) {
						acc.push(`\`${key}\`: ${getValue(field, key)}`);
					}
					return acc;
				}, [])
				.join('<br>'),
		];
		result.push(`| ${line.join(' | ')} |`);
	});

	result.push('');

	return result.join('\n');
}
