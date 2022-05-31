import { PickFromPath } from '@konecty/sdk/TypeUtils';
import { KonectyModule, ModuleConfig, KonectyDocument, FilterConditionValue, FilterConditions } from '@konecty/sdk/Module';
import { MetadataField } from '@konecty/sdk/types/metadata';
import { KonectyClientOptions } from '@konecty/sdk/Client';
import { FieldOperators } from '@konecty/sdk/FieldOperators';
import { FileDescriptor } from '@konecty/sdk/types';
import { Campaign } from './Campaign';
const webElementConfig: ModuleConfig = {
	name: 'WebElement',
	collection: 'data.WebElement',
	label: {
		en: 'Web Element',
		pt_BR: 'Elemento Web',
	},
	plurals: {
		en: 'Web Elements',
		pt_BR: 'Elementos Web',
	},
};
export type WebElementCampaignType = PickFromPath<Campaign, 'code' | 'name' | 'type'>;
export type WebElementWebElementType = { name: string };
export type WebElementParentsType = { name: string };
export type WebElementParentType = { code: number; name: string };
export type WebElementCreatedByType = { name: string; group: { name: unknown } };
export type WebElementUpdatedByType = { name: string; group: { name: unknown } };
export type WebElementUserType = { name: string; group: { name: unknown } };
export type WebElementLinkTargetType = '_parent' | '_blank' | '_self' | '_top';
export type WebElementPriorityType = 'Média' | 'Baixa' | 'Alta';
export type WebElementStatusType = 'Ativo' | 'Inativo';
export type WebElementTypeType = 'HTML' | 'Konecty';
export interface WebElement extends KonectyDocument<WebElementUserType[], WebElementCreatedByType, WebElementUpdatedByType> {
	campaign: WebElementCampaignType;
	code: number;
	endAt: Date;
	file: FileDescriptor[];
	html: string[];
	markdown: string[];
	linkLabel: string;
	link: string;
	slug: string;
	author: string;
	linkTarget: WebElementLinkTargetType;
	name: string;
	order: number;
	priority: WebElementPriorityType;
	startAt: Date;
	status: WebElementStatusType;
	type: WebElementTypeType;
	webElement: WebElementWebElementType[];
	parents: WebElementParentsType[];
	parent: WebElementParentType;
	_createdAt: Date;
	_createdBy: WebElementCreatedByType;
	_updatedAt: Date;
	_updatedBy: WebElementUpdatedByType;
	_user: WebElementUserType[];
}
export type WebElementFilterConditions =
	| FilterConditions
	| FilterConditionValue<'campaign', FieldOperators<'lookup'>, WebElementCampaignType>
	| FilterConditionValue<'campaign._id', FieldOperators<'lookup._id'>, WebElementCampaignType>
	| FilterConditionValue<'code', FieldOperators<'autoNumber'>, number>
	| FilterConditionValue<'endAt', FieldOperators<'dateTime'>, Date>
	| FilterConditionValue<'file', FieldOperators<'file'>, FileDescriptor>
	| FilterConditionValue<'html', FieldOperators<'richText'>, string>
	| FilterConditionValue<'markdown', FieldOperators<'text'>, string>
	| FilterConditionValue<'linkLabel', FieldOperators<'text'>, string>
	| FilterConditionValue<'link', FieldOperators<'text'>, string>
	| FilterConditionValue<'slug', FieldOperators<'text'>, string>
	| FilterConditionValue<'author', FieldOperators<'text'>, string>
	| FilterConditionValue<'linkTarget', FieldOperators<'picklist'>, WebElementLinkTargetType>
	| FilterConditionValue<'name', FieldOperators<'text'>, string>
	| FilterConditionValue<'order', FieldOperators<'number'>, number>
	| FilterConditionValue<'priority', FieldOperators<'picklist'>, WebElementPriorityType>
	| FilterConditionValue<'startAt', FieldOperators<'dateTime'>, Date>
	| FilterConditionValue<'status', FieldOperators<'picklist'>, WebElementStatusType>
	| FilterConditionValue<'type', FieldOperators<'picklist'>, WebElementTypeType>
	| FilterConditionValue<'webElement', FieldOperators<'lookup'>, WebElementWebElementType>
	| FilterConditionValue<'webElement._id', FieldOperators<'lookup._id'>, WebElementWebElementType>
	| FilterConditionValue<'parents', FieldOperators<'lookup'>, WebElementParentsType>
	| FilterConditionValue<'parents._id', FieldOperators<'lookup._id'>, WebElementParentsType>
	| FilterConditionValue<'parent', FieldOperators<'lookup'>, WebElementParentType>
	| FilterConditionValue<'parent._id', FieldOperators<'lookup._id'>, WebElementParentType>
	| FilterConditionValue<'_createdAt', FieldOperators<'dateTime'>, Date>
	| FilterConditionValue<'_createdBy', FieldOperators<'lookup'>, WebElementCreatedByType>
	| FilterConditionValue<'_createdBy._id', FieldOperators<'lookup._id'>, WebElementCreatedByType>
	| FilterConditionValue<'_updatedAt', FieldOperators<'dateTime'>, Date>
	| FilterConditionValue<'_updatedBy', FieldOperators<'lookup'>, WebElementUpdatedByType>
	| FilterConditionValue<'_updatedBy._id', FieldOperators<'lookup._id'>, WebElementUpdatedByType>
	| FilterConditionValue<'_user', FieldOperators<'lookup'>, WebElementUserType>
	| FilterConditionValue<'_user._id', FieldOperators<'lookup._id'>, WebElementUserType>;
export type WebElementSortFields =
	| 'campaign'
	| 'code'
	| 'endAt'
	| 'file'
	| 'linkLabel'
	| 'link'
	| 'slug'
	| 'author'
	| 'linkTarget'
	| 'name'
	| 'order'
	| 'priority'
	| 'startAt'
	| 'status'
	| 'type'
	| 'webElement'
	| '_createdAt'
	| '_createdBy'
	| '_updatedAt'
	| '_user';
export class WebElementModule extends KonectyModule<
	WebElement,
	WebElementFilterConditions,
	WebElementSortFields,
	WebElementUserType[],
	WebElementCreatedByType,
	WebElementUpdatedByType
> {
	constructor(clientOptions?: KonectyClientOptions) {
		super(webElementConfig, clientOptions);
	}
	readonly campaign: MetadataField<WebElementCampaignType> = {
		type: 'lookup',
		name: 'campaign',
		label: { en: 'Campaign', pt_BR: 'Campanha' },
		isSortable: true,
		document: 'Campaign',
		descriptionFields: ['code', 'name', 'type'],
		isInherited: true,
	} as MetadataField<WebElementCampaignType>;
	readonly code: MetadataField<number> = {
		isSortable: true,
		type: 'autoNumber',
		name: 'code',
		label: { en: 'Code', pt_BR: 'Código' },
		isUnique: true,
		isInherited: true,
	} as MetadataField<number>;
	readonly endAt: MetadataField<Date> = {
		type: 'dateTime',
		name: 'endAt',
		label: { en: 'End', pt_BR: 'Término' },
		isSortable: true,
		isInherited: true,
	} as MetadataField<Date>;
	readonly file: MetadataField<FileDescriptor> = {
		type: 'file',
		name: 'file',
		label: { en: 'File', pt_BR: 'Arquivo' },
		isSortable: true,
		isList: true,
		isListTypeOptionsEditable: true,
		wildcard: '(jpg|jpeg|png|pdf|svg)',
		isInherited: true,
	} as MetadataField<FileDescriptor>;
	readonly html: MetadataField<string> = {
		type: 'richText',
		name: 'html',
		label: { en: 'HTML Content', pt_BR: 'Conteúdo HTML' },
		isList: true,
		isInherited: true,
	} as MetadataField<string>;
	readonly markdown: MetadataField<string> = {
		type: 'text',
		name: 'markdown',
		label: { en: 'Markdown Content', pt_BR: 'Conteúdo Markdown' },
		isList: true,
		isInherited: true,
	} as MetadataField<string>;
	readonly linkLabel: MetadataField<string> = {
		name: 'linkLabel',
		label: { en: 'Link Label', pt_BR: 'Texto do Link' },
		isSortable: true,
		type: 'text',
		isInherited: true,
	} as MetadataField<string>;
	readonly link: MetadataField<string> = {
		name: 'link',
		label: { en: 'Link', pt_BR: 'Link' },
		isSortable: true,
		type: 'text',
		isInherited: true,
	} as MetadataField<string>;
	readonly slug: MetadataField<string> = {
		name: 'slug',
		label: { en: 'Slug', pt_BR: 'Identificador' },
		isSortable: true,
		type: 'text',
		isInherited: true,
	} as MetadataField<string>;
	readonly author: MetadataField<string> = {
		name: 'author',
		label: { en: 'Author', pt_BR: 'Autor' },
		isSortable: true,
		type: 'text',
	} as MetadataField<string>;
	readonly linkTarget: MetadataField<WebElementLinkTargetType> = {
		maxSelected: 1,
		name: 'linkTarget',
		options: {
			_parent: { en: '_parent', pt_BR: '_parent' },
			_blank: { en: '_blank', pt_BR: '_blank' },
			_self: { en: '_self', pt_BR: '_self' },
			_top: { pt_BR: '_top', en: '_top' },
		},
		optionsSorter: 'asc',
		renderAs: 'with_scroll',
		type: 'picklist',
		isSortable: true,
		label: { en: 'Link Target', pt_BR: 'Target do Link' },
		isInherited: true,
	} as MetadataField<WebElementLinkTargetType>;
	readonly name: MetadataField<string> = {
		type: 'text',
		name: 'name',
		label: { en: 'Name', pt_BR: 'Nome' },
		isRequired: true,
		isSortable: true,
		isInherited: true,
	} as MetadataField<string>;
	readonly order: MetadataField<number> = {
		type: 'number',
		name: 'order',
		label: { en: 'Order', pt_BR: 'Ordem' },
		isSortable: true,
		decimalSize: 0,
		isInherited: true,
	} as MetadataField<number>;
	readonly priority: MetadataField<WebElementPriorityType> = {
		maxSelected: 1,
		minSelected: 0,
		name: 'priority',
		type: 'picklist',
		isSortable: true,
		label: { en: 'Priority', pt_BR: 'Prioridade' },
		options: {
			Média: { en: 'Medium', pt_BR: 'Média' },
			Baixa: { en: 'Low', pt_BR: 'Baixa' },
			Alta: { en: 'High', pt_BR: 'Alta' },
		},
		renderAs: 'without_scroll',
		isInherited: true,
	} as MetadataField<WebElementPriorityType>;
	readonly startAt: MetadataField<Date> = {
		type: 'dateTime',
		name: 'startAt',
		label: { en: 'Start', pt_BR: 'Início' },
		isSortable: true,
		isInherited: true,
	} as MetadataField<Date>;
	readonly status: MetadataField<WebElementStatusType> = {
		name: 'status',
		maxSelected: 1,
		minSelected: 1,
		options: { Ativo: { en: 'Active', pt_BR: 'Ativo' }, Inativo: { en: 'Inactive', pt_BR: 'Inativo' } },
		renderAs: 'without_scroll',
		type: 'picklist',
		isSortable: true,
		label: { en: 'Status', pt_BR: 'Situação' },
		isInherited: true,
	} as MetadataField<WebElementStatusType>;
	readonly type: MetadataField<WebElementTypeType> = {
		isSortable: true,
		label: { en: 'Type', pt_BR: 'Tipo' },
		options: { HTML: { en: 'HTML', pt_BR: 'HTML' }, Konecty: { en: 'Konecty', pt_BR: 'Konecty' } },
		renderAs: 'without_scroll',
		type: 'picklist',
		maxSelected: 1,
		minSelected: 1,
		name: 'type',
		optionsSorter: 'asc',
		isInherited: true,
	} as MetadataField<WebElementTypeType>;
	readonly webElement: MetadataField<WebElementWebElementType> = {
		name: 'webElement',
		label: { en: 'Web Element', pt_BR: 'Elemento Web' },
		isSortable: true,
		isList: true,
		isListTypeOptionsEditable: true,
		document: 'WebElement',
		descriptionFields: ['name'],
		type: 'lookup',
		isInherited: true,
	} as MetadataField<WebElementWebElementType>;
	readonly parents: MetadataField<WebElementParentsType> = {
		type: 'lookup',
		name: 'parents',
		isList: true,
		label: { en: 'Parents', pt_BR: 'Pais' },
		document: 'WebElement',
		linkedFormName: 'Default',
		descriptionFields: ['name'],
		isInherited: true,
	} as MetadataField<WebElementParentsType>;
	readonly parent: MetadataField<WebElementParentType> = {
		type: 'lookup',
		name: 'parent',
		label: { en: 'Parent', pt_BR: 'Sub Elementos Web de' },
		document: 'WebElement',
		linkedFormName: 'Default',
		descriptionFields: ['code', 'name'],
		inheritedFields: [{ inherit: 'hierarchy_always', fieldName: 'parents' }],
		isInherited: true,
	} as MetadataField<WebElementParentType>;
	readonly _createdAt: MetadataField<Date> = {
		type: 'dateTime',
		name: '_createdAt',
		label: { en: 'Created At', pt_BR: 'Criado em' },
		isSortable: true,
		isInherited: true,
	} as MetadataField<Date>;
	readonly _createdBy: MetadataField<WebElementCreatedByType> = {
		isSortable: true,
		document: 'User',
		descriptionFields: ['name', 'group.name'],
		type: 'lookup',
		name: '_createdBy',
		label: { en: 'Created by', pt_BR: 'Criado por' },
		isInherited: true,
	} as MetadataField<WebElementCreatedByType>;
	readonly _updatedAt: MetadataField<Date> = {
		isSortable: true,
		type: 'dateTime',
		name: '_updatedAt',
		label: { en: 'Updated At', pt_BR: 'Atualizado em' },
		isInherited: true,
	} as MetadataField<Date>;
	readonly _updatedBy: MetadataField<WebElementUpdatedByType> = {
		descriptionFields: ['name', 'group.name'],
		type: 'lookup',
		name: '_updatedBy',
		label: { en: 'Updated by', pt_BR: 'Atualizado por' },
		document: 'User',
		isInherited: true,
	} as MetadataField<WebElementUpdatedByType>;
	readonly _user: MetadataField<WebElementUserType> = {
		name: '_user',
		label: { en: 'User', pt_BR: 'Usuário' },
		isSortable: true,
		isList: true,
		document: 'User',
		descriptionFields: ['name', 'group.name', 'active'],
		detailFields: ['phone', 'emails'],
		type: 'lookup',
		isInherited: true,
	} as MetadataField<WebElementUserType>;
}
