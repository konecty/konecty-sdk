import { Document } from './Document';
import { FieldOperators } from './FieldOperators';
import { Paths, TypeFromPath } from './TypeUtils';

export enum FieldType {
	text = 'text',
	url = 'url',
	email = 'email',
	number = 'number',
	autoNumber = 'autoNumber',
	date = 'date',
	dateTime = 'dateTime',
	money = 'money',
	boolean = 'boolean',
	address = 'address',
	personName = 'personName',
	phone = 'phone',
	picklist = 'picklist',
	lookup = 'lookup',
	ObjectId = 'ObjectId',
	encrypted = 'encrypted',
	filter = 'filter',
	richText = 'richText',
	file = 'file',
	percentage = 'percentage',
	JSON = 'json',
}

export type FieldValidators<T> = (target: Document<T>, propertyKey: string, value: Field<T>) => boolean;

export type Label = {
	[lang: string]: string;
};

// type FieldAllowedTypes = number
// | string
// | Email
// | Date
// | Money
// | boolean
// | Address
// | PersonName
// | Phone
// | OptionsType
// | LookupDescriptionType
// | Filter
// | FileDescriptor;

export type Field<T> = {
	document?: Document<T>;
	descriptionFields?: (string | number | symbol)[];
	inheritedFields?: (string | number | symbol)[];
	type: FieldType;
	label?: Label;
	isList?: boolean;
	sortable?: boolean;
	minSelect?: number;
	maxSelect?: number;
	options?: FieldOptions;
	validators?: FieldValidators<T>[];
	get(): T;
	set(value: T): void;
	// readonly valid: boolean;
	//  = {
	// 	get() {
	// 		if (this.validators != null) {
	// 			return (
	// 				re.test(target[propertyKey]) && descriptor.validators.every(v => v(target, propertyKey, target[propertyKey]))
	// 			);
	// 		}
	// 		return true;
	// 	},
	// };
	toString: (format?: string) => string | (() => string);
	// = (format) => {

	// 	if (this.type === FieldType.Date) {

	// 	}
	// 	return ''
	// };

	// value: T;
};

export type Email = {
	type: string;
	address: string;
};

export type Money = {
	currency?: string;
	value: number;
};

export type Address = {
	country?: string;
	state: string;
	city: string;
	district: string;
	placeType?: string;
	place: string;
	number: string;
	postalCode?: string;
	complement?: string;
	geolocation?: [number, number];
};

export type PersonName = {
	first: string;
	last: string;
	full: string;
};

export type Phone = {
	countryCode?: string;
	phoneNumber: string;
};

export type FieldOptions = {
	[key: string]:
		| {
				[lang: string]: string;
		  }
		| { sort?: number };
};

type FilterRange<T> = {
	greater_or_equals: T;
	less_or_equals: T;
};

export type FilterCondition<D extends Document<unknown>, K extends Paths<D>> = {
	term: K;
	operator: FieldOperators<K> extends never ? FieldOperators<TypeFromPath<D, K>> : FieldOperators<K>;
	value:
		| FilterRange<FieldOperators<TypeFromPath<D, K>>>
		| FieldOperators<TypeFromPath<D, K>>
		| FieldOperators<TypeFromPath<D, K>>[];
	editable: boolean;
	disabled: boolean;
};

export type Filter<T extends Document<unknown>> = {
	match: 'and' | 'or';
	conditions: (Filter<T> | FilterCondition<T, Paths<T>>)[];
};

export type FileDescriptor = {
	key: string;
	name: string;
	etag?: string;
	kind?: string;
	size?: number;
};
