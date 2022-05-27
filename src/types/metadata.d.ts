export type MetadataFieldType =
	| 'address'
	| 'autoNumber'
	| 'boolean'
	| 'composite'
	| 'date'
	| 'dateTime'
	| 'email'
	| 'encrypted'
	| 'file'
	| 'filter'
	| 'geoloc'
	| 'json'
	| 'lookup'
	| 'money'
	| 'number'
	| 'password'
	| 'percentage'
	| 'personName'
	| 'phone'
	| 'picklist'
	| 'richText'
	| 'text'
	| 'time'
	| 'url'
	| 'ObjectId';

export type MetadataFieldInheritModel = 'hierarchy_always' | 'once_editable' | 'until_edited' | 'always' | 'once';

export type MetadataConditionOperator =
	| 'exists'
	| 'equals'
	| 'not_equals'
	| 'in'
	| 'not_in'
	| 'contains'
	| 'not_contains'
	| 'starts_with'
	| 'end_with'
	| 'less_than'
	| 'greater_than'
	| 'less_or_equals'
	| 'greater_or_equals'
	| 'between';

export type MetadataNormalizationOptions =
	| 'title'
	| 'none'
	| 'upper'
	| 'lower'
	| 'camel'
	| 'capital'
	| 'constant'
	| 'dot'
	| 'header'
	| 'param'
	| 'pascal'
	| 'path'
	| 'sentence'
	| 'snake';

export type MetadataConditionField = {
	term: string;
	operator: MetadataConditionOperator;
	valueField: string;
};

export type MetadataLabel = {
	[lang: string]: string;
};

export type MetadataField<T = unknown> = {
	name: string;
	type: MetadataFieldType;
	size?: number;
	label?: MetadataLabel;
	options?: {
		[key: string]: MetadataLabel;
	};
	decimalSize?: number;
	minSelected?: number;
	maxSelected?: number;
	optionsSorter?: string;
	defaultValue?: T;
	document?: string;
	descriptionFields?: string[];
	detailFields?: string[];
	inheritedFields?: {
		fieldName: string;
		inherit: MetadataFieldInheritModel;
	}[];
	wildcard?: string;
	maxSize?: number;
	isList?: boolean;
	isUnique?: boolean;
	isSortable?: boolean;
	isRequired?: boolean;
	access?: string;
	bits?: number;
	columns?: number;
	comments?: string;
	objectRefId?: string;
	compositeType?: 'reference';
	conditionFields?: MetadataConditionField[];
	decimalSize?: number;
	defaultValues?: T[];
	description?: string;
	filterOnly?: boolean;
	filterableFields?: string[];
	help?: MetadataLabel;
	isInherited?: boolean;
	linkedFormName?: string;
	minItems?: number;
	maxItems?: number;
	maxLength?: number;
	minValue?: T;
	maxValue?: T;
	normalization?: MetadataNormalizationOptions;
	readOnlyVersion?: boolean;
	relations?: object[]; // TODO: define filter type
	renderAs?: string;

	isTypeOptionsEditable?: boolean;
	isListTypeOptionsEditable?: boolean;
	typeOptions?: {
		[key: string]: MetadataLabel;
	};
};

export type MetadataDocument = {
	_id: string;
	collection?: string;
	type: 'document' | 'composite';
	name: string;
	label?: MetadataLabel;
	plurals?: MetadataLabel;
	description?: MetadataLabel;
	fields: {
		[key: string]: MetadataField;
	};
	group?: string;
	help?: MetadataLabel;
	icon?: string;
	ignoreUpdatedAt?: boolean;
	indexText?: {
		[key: string]: 1 | -1;
	};
	indexes?: {
		[name: string]: {
			keys: {
				[key: string]: 1 | -1;
			};
		};
	};
	menuSorter?: number;
	namespace?: string[];
	parent?: string;
	relations?: object[]; // TODO: define
	saveHistory?: boolean;
	sendAlerts?: boolean;
};
