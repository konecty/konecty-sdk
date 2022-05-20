import 'reflect-metadata';
import { KonectyDocument } from '../Document';
import { FieldOptions, FieldType } from '../types';
import { Paths } from '../TypeUtils';

export function ObjectIdField(target: KonectyDocument, propertyKey: string) {
	Reflect.defineMetadata('type', FieldType.ObjectId, target, propertyKey);
}

export function AutoNumberField(target: KonectyDocument, propertyKey: string) {
	Reflect.defineMetadata('type', FieldType.autoNumber, target, propertyKey);
}
export function TextField(target: KonectyDocument, propertyKey: string) {
	Reflect.defineMetadata('type', FieldType.text, target, propertyKey);
}

export function UrlField(target: KonectyDocument, propertyKey: string) {
	Reflect.defineMetadata('type', FieldType.url, target, propertyKey);
}

export function EmailField(target: KonectyDocument, propertyKey: string) {
	Reflect.defineMetadata('type', FieldType.email, target, propertyKey);
}

export function NumberField(target: KonectyDocument, propertyKey: string) {
	Reflect.defineMetadata('type', FieldType.number, target, propertyKey);
}

export function DateField(target: KonectyDocument, propertyKey: string) {
	Reflect.defineMetadata('type', FieldType.date, target, propertyKey);
}

export function DateTimeField(target: KonectyDocument, propertyKey: string) {
	Reflect.defineMetadata('type', FieldType.dateTime, target, propertyKey);
}

export function MoneyField(target: KonectyDocument, propertyKey: string) {
	Reflect.defineMetadata('type', FieldType.money, target, propertyKey);
}

export function BooleanField(target: KonectyDocument, propertyKey: string) {
	Reflect.defineMetadata('type', FieldType.boolean, target, propertyKey);
}

export function AddressField(target: KonectyDocument, propertyKey: string) {
	Reflect.defineMetadata('type', FieldType.address, target, propertyKey);
}

export function PersonNameField(target: KonectyDocument, propertyKey: string) {
	Reflect.defineMetadata('type', FieldType.personName, target, propertyKey);
}

export function PhoneField(target: KonectyDocument, propertyKey: string) {
	Reflect.defineMetadata('type', FieldType.phone, target, propertyKey);
}

export function PicklistField(options: FieldOptions) {
	return function (target: KonectyDocument, propertyKey: string) {
		Reflect.defineMetadata('type', FieldType.picklist, target, propertyKey);
		Reflect.defineMetadata('options', options, target, propertyKey);
	};
}

interface LookupOptions<T extends KonectyDocument> {
	document: T;
	descriptionFields: Paths<T>[];
	inheritedFields?: Paths<T>[];
}
export function LookupField<T extends KonectyDocument>({ document, descriptionFields, inheritedFields }: LookupOptions<T>) {
	// type LookupDescriptionKeyType = typeof descriptionFields[number];
	// type LookupDescriptionType = Partial<Pick<T, LookupDescriptionKeyType>>;
	return function (target: KonectyDocument, propertyKey: string) {
		Reflect.defineMetadata('type', FieldType.lookup, target, propertyKey);
		Reflect.defineMetadata('document', document, target, propertyKey);
		Reflect.defineMetadata('descriptionFields', descriptionFields, target, propertyKey);
		Reflect.defineMetadata('inheritedFields', inheritedFields, target, propertyKey);
	};
}

export function EncryptedField(target: KonectyDocument, propertyKey: string) {
	Reflect.defineMetadata('type', FieldType.date, target, propertyKey);
}

export function FilterField(target: KonectyDocument, propertyKey: string) {
	Reflect.defineMetadata('type', FieldType.filter, target, propertyKey);
}

export function RichTextField(target: KonectyDocument, propertyKey: string) {
	Reflect.defineMetadata('type', FieldType.richText, target, propertyKey);
}

export function FileField(target: KonectyDocument, propertyKey: string) {
	Reflect.defineMetadata('type', FieldType.file, target, propertyKey);
}

export function PercentageField(target: KonectyDocument, propertyKey: string) {
	Reflect.defineMetadata('type', FieldType.percentage, target, propertyKey);
}

export function JSONField(target: KonectyDocument, propertyKey: string) {
	Reflect.defineMetadata('type', FieldType.JSON, target, propertyKey);
}
