import { PickFromPath } from '@konecty/sdk/TypeUtils';
import { KonectyModule, ModuleConfig, KonectyDocument, FilterConditionValue, FilterConditions } from '@konecty/sdk/Module';
import { MetadataField } from 'types/metadata';
import { KonectyClientOptions } from 'lib/KonectyClient';
import { FieldOperators } from '@konecty/sdk/FieldOperators';
import { FileDescriptor } from '@konecty/sdk/types';
const templateConfig: ModuleConfig = {
	name: 'Template',
	collection: 'data.Template',
	label: {
		en: 'Mail Template',
		pt_BR: 'Modelo de email',
	},
	plurals: {
		en: 'Mail Templates',
		pt_BR: 'Modelos de email',
	},
};
export type TemplateCreatedByType = { name: string; group: { name: unknown } };
export type TemplateUpdatedByType = { name: string; group: { name: unknown } };
export type TemplateUserType = { name: string; group: { name: unknown } };
export type TemplateTypeType = 'email';
export interface Template extends KonectyDocument<TemplateUserType[], TemplateCreatedByType, TemplateUpdatedByType> {
	code: number;
	name: string;
	type: TemplateTypeType;
	webServices: object;
	style: string;
	document: string;
	view: string;
	value: string;
	subject: string;
	_createdAt: Date;
	_createdBy: TemplateCreatedByType;
	_updatedAt: Date;
	_updatedBy: TemplateUpdatedByType;
	_user: TemplateUserType[];
	attachment: FileDescriptor[];
}
export type TemplateFilterConditions =
	| FilterConditions
	| FilterConditionValue<'code', FieldOperators<'autoNumber'>, number>
	| FilterConditionValue<'name', FieldOperators<'text'>, string>
	| FilterConditionValue<'type', FieldOperators<'picklist'>, TemplateTypeType>
	| FilterConditionValue<'style', FieldOperators<'text'>, string>
	| FilterConditionValue<'document', FieldOperators<'text'>, string>
	| FilterConditionValue<'view', FieldOperators<'text'>, string>
	| FilterConditionValue<'value', FieldOperators<'text'>, string>
	| FilterConditionValue<'subject', FieldOperators<'text'>, string>
	| FilterConditionValue<'_createdAt', FieldOperators<'dateTime'>, Date>
	| FilterConditionValue<'_createdBy', FieldOperators<'lookup'>, TemplateCreatedByType>
	| FilterConditionValue<'_createdBy._id', FieldOperators<'lookup._id'>, TemplateCreatedByType>
	| FilterConditionValue<'_updatedAt', FieldOperators<'dateTime'>, Date>
	| FilterConditionValue<'_updatedBy', FieldOperators<'lookup'>, TemplateUpdatedByType>
	| FilterConditionValue<'_updatedBy._id', FieldOperators<'lookup._id'>, TemplateUpdatedByType>
	| FilterConditionValue<'_user', FieldOperators<'lookup'>, TemplateUserType>
	| FilterConditionValue<'_user._id', FieldOperators<'lookup._id'>, TemplateUserType>
	| FilterConditionValue<'attachment', FieldOperators<'file'>, FileDescriptor>;
export class TemplateModule extends KonectyModule<
	Template,
	TemplateFilterConditions,
	TemplateUserType[],
	TemplateCreatedByType,
	TemplateUpdatedByType
> {
	constructor(clientOptions?: KonectyClientOptions) {
		super(templateConfig, clientOptions);
	}
	readonly code: MetadataField<number> = {
		type: 'autoNumber',
		name: 'code',
		label: { en: 'Code', pt_BR: 'Código' },
		isUnique: true,
		isSortable: true,
		isInherited: true,
	} as MetadataField<number>;
	readonly name: MetadataField<string> = {
		isSortable: true,
		type: 'text',
		name: 'name',
		label: { pt_BR: 'Nome', en: 'Name' },
		isInherited: true,
	} as MetadataField<string>;
	readonly type: MetadataField<TemplateTypeType> = {
		type: 'picklist',
		name: 'type',
		isSortable: true,
		label: { en: 'Type', pt_BR: 'Tipo' },
		options: { email: { en: 'email', pt_BR: 'email', sort: 1 } },
		renderAs: 'with_scroll',
		maxSelected: 1,
		minSelected: 1,
		defaultValue: 'email',
		isInherited: true,
		optionsSorter: 'sort',
	} as MetadataField<TemplateTypeType>;
	readonly webServices: MetadataField<object> = {
		type: 'json',
		name: 'webServices',
		label: { en: 'Web Services', pt_BR: 'Serviços Web' },
		isInherited: true,
	} as MetadataField<object>;
	readonly style: MetadataField<string> = {
		name: 'style',
		label: { en: 'Style', pt_BR: 'Estilo' },
		type: 'text',
		isInherited: true,
	} as MetadataField<string>;
	readonly document: MetadataField<string> = {
		label: { en: 'Module', pt_BR: 'Módulo' },
		isSortable: true,
		type: 'text',
		name: 'document',
		isInherited: true,
	} as MetadataField<string>;
	readonly view: MetadataField<string> = {
		type: 'text',
		name: 'view',
		label: { en: 'View', pt_BR: 'Vizualização' },
		isSortable: true,
		isInherited: true,
	} as MetadataField<string>;
	readonly value: MetadataField<string> = {
		type: 'text',
		name: 'value',
		label: { en: 'Body', pt_BR: 'Corpo' },
		isInherited: true,
	} as MetadataField<string>;
	readonly subject: MetadataField<string> = {
		type: 'text',
		name: 'subject',
		label: { en: 'Subject', pt_BR: 'Assunto' },
		isInherited: true,
	} as MetadataField<string>;
	readonly _createdAt: MetadataField<Date> = {
		type: 'dateTime',
		name: '_createdAt',
		label: { pt_BR: 'Criado em', en: 'Created At' },
		isSortable: true,
		isInherited: true,
	} as MetadataField<Date>;
	readonly _createdBy: MetadataField<TemplateCreatedByType> = {
		label: { en: 'Created by', pt_BR: 'Criado por' },
		isSortable: true,
		document: 'User',
		descriptionFields: ['name', 'group.name'],
		type: 'lookup',
		name: '_createdBy',
		isInherited: true,
	} as MetadataField<TemplateCreatedByType>;
	readonly _updatedAt: MetadataField<Date> = {
		name: '_updatedAt',
		label: { en: 'Updated At', pt_BR: 'Atualizado em' },
		isSortable: true,
		type: 'dateTime',
		isInherited: true,
	} as MetadataField<Date>;
	readonly _updatedBy: MetadataField<TemplateUpdatedByType> = {
		label: { en: 'Updated by', pt_BR: 'Atualizado por' },
		document: 'User',
		descriptionFields: ['name', 'group.name'],
		type: 'lookup',
		name: '_updatedBy',
		isInherited: true,
	} as MetadataField<TemplateUpdatedByType>;
	readonly _user: MetadataField<TemplateUserType> = {
		type: 'lookup',
		name: '_user',
		label: { en: 'User', pt_BR: 'Usuário' },
		isSortable: true,
		isList: true,
		document: 'User',
		descriptionFields: ['name', 'group.name', 'active'],
		detailFields: ['phone', 'emails'],
		isInherited: true,
	} as MetadataField<TemplateUserType>;
	readonly attachment: MetadataField<FileDescriptor> = {
		type: 'file',
		name: 'attachment',
		label: { en: 'Attachment', pt_BR: 'Anexo' },
		isList: true,
		wildcard: '(pdf|jpg|jpeg|png)',
		isInherited: true,
	} as MetadataField<FileDescriptor>;
}
