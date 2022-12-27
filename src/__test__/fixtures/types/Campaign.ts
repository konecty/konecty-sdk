import { PickFromPath, UnionToIntersection } from '@konecty/sdk/TypeUtils';
import {
	KonectyModule,
	ModuleConfig,
	KonectyDocument,
	FilterConditionValue,
	FilterConditions,
	ModuleFilter,
} from '@konecty/sdk/Module';
import { MetadataField } from '@konecty/sdk/types/metadata';
import { KonectyClientOptions } from '@konecty/sdk/Client';
import { FieldOperators } from '@konecty/sdk/FieldOperators';
import { FileDescriptor, Phone } from '@konecty/sdk/types';
import { Contact, ContactFilterConditions } from './Contact';
import { Product, ProductFilterConditions } from './Product';
import { Queue } from './Queue';
import { Template } from './Template';
import { WebElement } from './WebElement';
import { UserFilterConditions } from './User';
const campaignConfig: ModuleConfig = {
	name: 'Campaign',
	collection: 'data.Campaign',
	label: {
		en: 'Campaign',
		pt_BR: 'Campanha',
	},
	plurals: {
		en: 'Campaigns',
		pt_BR: 'Campanhas',
	},
};
export type CampaignMainCampaignType = { _id: string; code: number; name: string };
export type CampaignCreatedByType = { _id: string; name: string; group: { name: unknown } };
export type CampaignUpdatedByType = { _id: string; name: string; group: { name: unknown } };
export type CampaignUserType = { _id: string; name: string; group: { name: unknown } };
export type CampaignProductsType = UnionToIntersection<PickFromPath<Product, '_id' | 'code' | 'name'>>;
export type CampaignWebElementType = UnionToIntersection<PickFromPath<WebElement, '_id' | 'code' | 'name' | 'type'>>;
export type CampaignProductType = UnionToIntersection<PickFromPath<Product, '_id' | 'code' | 'name'>>;
export type CampaignTargetQueueType = UnionToIntersection<PickFromPath<Queue, '_id' | 'name'>>;
export type CampaignChatQueueType = UnionToIntersection<PickFromPath<Queue, '_id' | 'name'>>;
export type CampaignFirstTouchTemplateType = UnionToIntersection<PickFromPath<Template, '_id' | 'code' | 'name'>>;
export type CampaignFirstTouchSenderType = { _id: string; name: string; group: { name: unknown } };
export type CampaignStatusType = 'Nova' | 'Em Andamento' | 'Concluída' | 'Cancelada';
export type CampaignTypeType =
	| 'Anúncio'
	| 'Feira ou convenção'
	| 'Web - Chat'
	| 'Outros'
	| 'Oferta Ativa'
	| 'Web - Site'
	| 'Web - Formulário'
	| 'Web - Hotsite'
	| 'Relacionamento Corretor'
	| 'Anúncio Face'
	| 'Seleção de Imóveis'
	| 'Portal'
	| 'Email marketing';
export type CampaignSendExactType = 'true' | 'false';
export interface Campaign extends KonectyDocument<CampaignUserType[], CampaignCreatedByType, CampaignUpdatedByType> {
	mainCampaign?: CampaignMainCampaignType;
	campaignTarget?: ModuleFilter<ContactFilterConditions>;
	campaignUser?: ModuleFilter<UserFilterConditions>;
	attachment?: FileDescriptor[];
	code?: number;
	description?: string;
	email?: string;
	endAt?: Date;
	name?: string;
	script?: string;
	startAt?: Date;
	status?: CampaignStatusType;
	type?: CampaignTypeType;
	_createdAt?: Date;
	_createdBy?: CampaignCreatedByType;
	_updatedAt?: Date;
	_updatedBy?: CampaignUpdatedByType;
	_user?: CampaignUserType[];
	identifier?: string;
	externalIdentifier?: string[];
	phone?: Phone[];
	notes?: string;
	products?: CampaignProductsType[];
	webElement?: CampaignWebElementType;
	product?: CampaignProductType;
	targetQueue?: CampaignTargetQueueType;
	chatQueue?: CampaignChatQueueType;
	chatTipTitle?: string;
	chatTipDescription?: string;
	chatTitle?: string;
	chatTitleBarColor?: string;
	chatTitleBarTextColor?: string;
	sendExact?: CampaignSendExactType;
	firstTouchTemplate?: CampaignFirstTouchTemplateType;
	firstTouchFile?: FileDescriptor;
	firstTouchSender?: CampaignFirstTouchSenderType;
	productFilter?: ModuleFilter<ProductFilterConditions>;
	badge?: FileDescriptor;
	content?: string[];
}
export type CampaignFilterConditions =
	| FilterConditions
	| FilterConditionValue<'mainCampaign', FieldOperators<'lookup'>, CampaignMainCampaignType>
	| FilterConditionValue<'mainCampaign._id', FieldOperators<'lookup._id'>, string>
	| FilterConditionValue<'attachment', FieldOperators<'file'>, FileDescriptor>
	| FilterConditionValue<'code', FieldOperators<'autoNumber'>, number>
	| FilterConditionValue<'description', FieldOperators<'richText'>, string>
	| FilterConditionValue<'email', FieldOperators<'richText'>, string>
	| FilterConditionValue<'endAt', FieldOperators<'dateTime'>, Date>
	| FilterConditionValue<'name', FieldOperators<'text'>, string>
	| FilterConditionValue<'script', FieldOperators<'richText'>, string>
	| FilterConditionValue<'startAt', FieldOperators<'dateTime'>, Date>
	| FilterConditionValue<'status', FieldOperators<'picklist'>, CampaignStatusType>
	| FilterConditionValue<'type', FieldOperators<'picklist'>, CampaignTypeType>
	| FilterConditionValue<'_createdAt', FieldOperators<'dateTime'>, Date>
	| FilterConditionValue<'_createdBy', FieldOperators<'lookup'>, CampaignCreatedByType>
	| FilterConditionValue<'_createdBy._id', FieldOperators<'lookup._id'>, string>
	| FilterConditionValue<'_updatedAt', FieldOperators<'dateTime'>, Date>
	| FilterConditionValue<'_updatedBy', FieldOperators<'lookup'>, CampaignUpdatedByType>
	| FilterConditionValue<'_updatedBy._id', FieldOperators<'lookup._id'>, string>
	| FilterConditionValue<'_user', FieldOperators<'lookup'>, CampaignUserType>
	| FilterConditionValue<'_user._id', FieldOperators<'lookup._id'>, string>
	| FilterConditionValue<'identifier', FieldOperators<'text'>, string>
	| FilterConditionValue<'externalIdentifier', FieldOperators<'text'>, string>
	| FilterConditionValue<'phone.phoneNumber', FieldOperators<'phone.phoneNumber'>, string>
	| FilterConditionValue<'phone.countryCode', FieldOperators<'phone.countryCode'>, string>
	| FilterConditionValue<'notes', FieldOperators<'text'>, string>
	| FilterConditionValue<'products', FieldOperators<'lookup'>, CampaignProductsType>
	| FilterConditionValue<'products._id', FieldOperators<'lookup._id'>, string>
	| FilterConditionValue<'webElement', FieldOperators<'lookup'>, CampaignWebElementType>
	| FilterConditionValue<'webElement._id', FieldOperators<'lookup._id'>, string>
	| FilterConditionValue<'product', FieldOperators<'lookup'>, CampaignProductType>
	| FilterConditionValue<'product._id', FieldOperators<'lookup._id'>, string>
	| FilterConditionValue<'targetQueue', FieldOperators<'lookup'>, CampaignTargetQueueType>
	| FilterConditionValue<'targetQueue._id', FieldOperators<'lookup._id'>, string>
	| FilterConditionValue<'chatQueue', FieldOperators<'lookup'>, CampaignChatQueueType>
	| FilterConditionValue<'chatQueue._id', FieldOperators<'lookup._id'>, string>
	| FilterConditionValue<'chatTipTitle', FieldOperators<'text'>, string>
	| FilterConditionValue<'chatTipDescription', FieldOperators<'text'>, string>
	| FilterConditionValue<'chatTitle', FieldOperators<'text'>, string>
	| FilterConditionValue<'chatTitleBarColor', FieldOperators<'text'>, string>
	| FilterConditionValue<'chatTitleBarTextColor', FieldOperators<'text'>, string>
	| FilterConditionValue<'sendExact', FieldOperators<'picklist'>, CampaignSendExactType>
	| FilterConditionValue<'firstTouchTemplate', FieldOperators<'lookup'>, CampaignFirstTouchTemplateType>
	| FilterConditionValue<'firstTouchTemplate._id', FieldOperators<'lookup._id'>, string>
	| FilterConditionValue<'firstTouchFile', FieldOperators<'file'>, FileDescriptor>
	| FilterConditionValue<'firstTouchSender', FieldOperators<'lookup'>, CampaignFirstTouchSenderType>
	| FilterConditionValue<'firstTouchSender._id', FieldOperators<'lookup._id'>, string>
	| FilterConditionValue<'badge', FieldOperators<'file'>, FileDescriptor>
	| FilterConditionValue<'content', FieldOperators<'text'>, string>;
export type CampaignSortFields =
	| 'mainCampaign'
	| 'code'
	| 'status'
	| '_createdAt'
	| '_createdBy'
	| '_updatedAt'
	| '_user'
	| 'identifier'
	| 'externalIdentifier'
	| 'targetQueue'
	| 'chatQueue'
	| 'sendExact'
	| 'firstTouchTemplate';
export class CampaignModule extends KonectyModule<
	Campaign,
	CampaignFilterConditions,
	CampaignSortFields,
	CampaignUserType[],
	CampaignCreatedByType,
	CampaignUpdatedByType
> {
	constructor(clientOptions?: KonectyClientOptions) {
		super(campaignConfig, clientOptions);
	}
	readonly 'mainCampaign': MetadataField<CampaignMainCampaignType> = {
		label: { en: 'Main Campaign', pt_BR: 'Campanha Principal' },
		isSortable: true,
		document: 'Campaign',
		descriptionFields: ['code', 'name'],
		type: 'lookup',
		name: 'mainCampaign',
		isInherited: true,
	} as MetadataField<CampaignMainCampaignType>;
	readonly 'campaignTarget': MetadataField<ModuleFilter<ContactFilterConditions>> = {
		label: { en: 'Campaign Target', pt_BR: 'Alvo da Campanha' },
		document: 'Contact',
		filterableFields: ['name'],
		relations: [{ reverseLookup: 'campaign', lookup: 'contact', document: 'CampaignTarget' }],
		type: 'filter',
		name: 'campaignTarget',
		isInherited: true,
	} as MetadataField<ModuleFilter<ContactFilterConditions>>;
	readonly 'campaignUser': MetadataField<ModuleFilter<UserFilterConditions>> = {
		label: { en: 'Campaign User', pt_BR: 'Usuário da Campanha' },
		document: 'User',
		filterableFields: ['name', 'email', 'role', 'nickname', 'active'],
		relations: [{ document: 'CampaignUser', reverseLookup: 'campaign', lookup: 'user' }],
		type: 'filter',
		name: 'campaignUser',
		isInherited: true,
	} as MetadataField<ModuleFilter<UserFilterConditions>>;
	readonly 'attachment': MetadataField<FileDescriptor> = {
		type: 'file',
		name: 'attachment',
		label: { en: 'Attachment', pt_BR: 'Anexo' },
		isList: true,
		wildcard: '(jpg|jpeg|png)',
		isInherited: true,
	} as MetadataField<FileDescriptor>;
	readonly 'code': MetadataField<number> = {
		type: 'autoNumber',
		name: 'code',
		label: { en: 'Code', pt_BR: 'Código' },
		isUnique: true,
		isSortable: true,
		isInherited: true,
	} as MetadataField<number>;
	readonly 'description': MetadataField<string> = {
		type: 'richText',
		name: 'description',
		label: { en: 'Description', pt_BR: 'Descrição' },
		isInherited: true,
	} as MetadataField<string>;
	readonly 'email': MetadataField<string> = {
		type: 'richText',
		name: 'email',
		label: { en: 'E-mail', pt_BR: 'E-mail' },
		isInherited: true,
	} as MetadataField<string>;
	readonly 'endAt': MetadataField<Date> = {
		type: 'dateTime',
		name: 'endAt',
		label: { pt_BR: 'Fim', en: 'End' },
		isInherited: true,
	} as MetadataField<Date>;
	readonly 'name': MetadataField<string> = {
		type: 'text',
		name: 'name',
		label: { en: 'Name', pt_BR: 'Nome' },
		isRequired: true,
		isInherited: true,
	} as MetadataField<string>;
	readonly 'script': MetadataField<string> = {
		label: { en: 'Script', pt_BR: 'Script' },
		type: 'richText',
		name: 'script',
		isInherited: true,
	} as MetadataField<string>;
	readonly 'startAt': MetadataField<Date> = {
		type: 'dateTime',
		name: 'startAt',
		label: { en: 'Start', pt_BR: 'Início' },
		isInherited: true,
	} as MetadataField<Date>;
	readonly 'status': MetadataField<CampaignStatusType> = {
		label: { en: 'Status', pt_BR: 'Situação' },
		options: {
			Nova: { en: 'New', pt_BR: 'Nova' },
			'Em Andamento': { en: 'In Progress', pt_BR: 'Em Andamento' },
			Concluída: { en: 'Completed', pt_BR: 'Concluída' },
			Cancelada: { pt_BR: 'Cancelada', en: 'Canceled' },
		},
		renderAs: 'without_scroll',
		type: 'picklist',
		isSortable: true,
		minSelected: 1,
		name: 'status',
		maxSelected: 1,
		isInherited: true,
	} as MetadataField<CampaignStatusType>;
	readonly 'type': MetadataField<CampaignTypeType> = {
		optionsSorter: 'asc',
		renderAs: 'without_scroll',
		type: 'picklist',
		label: { en: 'Type', pt_BR: 'Tipo' },
		maxSelected: 1,
		minSelected: 1,
		name: 'type',
		options: {
			Anúncio: { en: 'Advertisement', pt_BR: 'Anúncio' },
			'Feira ou convenção': { en: 'Trade Show', pt_BR: 'Feira ou convenção' },
			'Web - Chat': { en: 'Web - Chat', pt_BR: 'Web - Chat' },
			Outros: { en: 'Other', pt_BR: 'Outros' },
			'Oferta Ativa': { en: 'Cold Call', pt_BR: 'Oferta Ativa' },
			'Web - Site': { pt_BR: 'Web - Site', en: 'Web - Site' },
			'Web - Formulário': { en: 'Web - Form', pt_BR: 'Web - Formulário' },
			'Web - Hotsite': { en: 'Web - Hotsite', pt_BR: 'Web - Hotsite' },
			'Relacionamento Corretor': { en: 'Relationship Broker', pt_BR: 'Relacionamento Corretor' },
			'Anúncio Face': { en: 'Facebook Ad', pt_BR: 'Anúncio Face' },
			'Seleção de Imóveis': { en: 'Product Selection', pt_BR: 'Seleção de Imóveis' },
			Portal: { en: 'Portal', pt_BR: 'Portal' },
			'Email marketing': { en: 'Email marketing', pt_BR: 'Email marketing' },
		},
		isInherited: true,
	} as MetadataField<CampaignTypeType>;
	readonly '_createdAt': MetadataField<Date> = {
		type: 'dateTime',
		name: '_createdAt',
		label: { pt_BR: 'Criado em', en: 'Created At' },
		isSortable: true,
		isInherited: true,
	} as MetadataField<Date>;
	readonly '_createdBy': MetadataField<CampaignCreatedByType> = {
		label: { en: 'Created by', pt_BR: 'Criado por' },
		isSortable: true,
		document: 'User',
		descriptionFields: ['name', 'group.name'],
		type: 'lookup',
		name: '_createdBy',
		isInherited: true,
	} as MetadataField<CampaignCreatedByType>;
	readonly '_updatedAt': MetadataField<Date> = {
		type: 'dateTime',
		name: '_updatedAt',
		label: { en: 'Updated At', pt_BR: 'Atualizado em' },
		isSortable: true,
		isInherited: true,
	} as MetadataField<Date>;
	readonly '_updatedBy': MetadataField<CampaignUpdatedByType> = {
		type: 'lookup',
		name: '_updatedBy',
		label: { en: 'Updated by', pt_BR: 'Atualizado por' },
		document: 'User',
		descriptionFields: ['name', 'group.name'],
		isInherited: true,
	} as MetadataField<CampaignUpdatedByType>;
	readonly '_user': MetadataField<CampaignUserType> = {
		descriptionFields: ['name', 'group.name', 'active'],
		detailFields: ['phone', 'emails'],
		type: 'lookup',
		name: '_user',
		label: { en: 'User', pt_BR: 'Usuário' },
		isSortable: true,
		isList: true,
		document: 'User',
		isInherited: true,
	} as MetadataField<CampaignUserType>;
	readonly 'identifier': MetadataField<string> = {
		name: 'identifier',
		label: { en: 'Identifier', pt_BR: 'Identificador' },
		isSortable: true,
		type: 'text',
		isInherited: true,
	} as MetadataField<string>;
	readonly 'externalIdentifier': MetadataField<string> = {
		name: 'externalIdentifier',
		label: { en: 'External Identifier', pt_BR: 'Identificador Externo' },
		isSortable: true,
		type: 'text',
		isList: true,
		isInherited: true,
	} as MetadataField<string>;
	readonly 'phone': MetadataField<Phone> = {
		type: 'phone',
		name: 'phone',
		label: { pt_BR: 'Telefone', en: 'Phone' },
		isList: true,
	} as MetadataField<Phone>;
	readonly 'notes': MetadataField<string> = {
		label: { en: 'Notes', pt_BR: 'Observação' },
		type: 'text',
		name: 'notes',
	} as MetadataField<string>;
	readonly 'products': MetadataField<CampaignProductsType> = {
		descriptionFields: ['code', 'name'],
		type: 'lookup',
		name: 'products',
		label: { en: 'Products', pt_BR: 'Imóveis' },
		document: 'Product',
		isList: true,
	} as MetadataField<CampaignProductsType>;
	readonly 'webElement': MetadataField<CampaignWebElementType> = {
		descriptionFields: ['code', 'name', 'type'],
		type: 'lookup',
		name: 'webElement',
		label: { en: 'Web Element', pt_BR: 'Elemento Web' },
		document: 'WebElement',
	} as MetadataField<CampaignWebElementType>;
	readonly 'product': MetadataField<CampaignProductType> = {
		descriptionFields: ['code', 'name'],
		type: 'lookup',
		name: 'product',
		label: { en: 'Product', pt_BR: 'Imóvel' },
		document: 'Product',
	} as MetadataField<CampaignProductType>;
	readonly 'targetQueue': MetadataField<CampaignTargetQueueType> = {
		type: 'lookup',
		name: 'targetQueue',
		label: { en: 'Target Queue', pt_BR: 'Roleta' },
		isSortable: true,
		document: 'Queue',
		descriptionFields: ['name'],
	} as MetadataField<CampaignTargetQueueType>;
	readonly 'chatQueue': MetadataField<CampaignChatQueueType> = {
		type: 'lookup',
		name: 'chatQueue',
		label: { en: 'Chat Queue', pt_BR: 'Roleta do Chat' },
		isSortable: true,
		document: 'Queue',
		descriptionFields: ['name'],
	} as MetadataField<CampaignChatQueueType>;
	readonly 'chatTipTitle': MetadataField<string> = {
		label: { en: 'Tip Title', pt_BR: 'Título do Balão' },
		type: 'text',
		name: 'chatTipTitle',
	} as MetadataField<string>;
	readonly 'chatTipDescription': MetadataField<string> = {
		label: { en: 'Tip Description', pt_BR: 'Descrição do Balão' },
		type: 'text',
		name: 'chatTipDescription',
	} as MetadataField<string>;
	readonly 'chatTitle': MetadataField<string> = {
		label: { en: 'Chat Title', pt_BR: 'Título do Chat' },
		type: 'text',
		name: 'chatTitle',
	} as MetadataField<string>;
	readonly 'chatTitleBarColor': MetadataField<string> = {
		label: { en: 'Title Bar Color', pt_BR: 'Cor da Barra de Título' },
		type: 'text',
		name: 'chatTitleBarColor',
	} as MetadataField<string>;
	readonly 'chatTitleBarTextColor': MetadataField<string> = {
		label: { en: 'Title Bar Text Color', pt_BR: 'Cor do Text da Barra de Título' },
		type: 'text',
		name: 'chatTitleBarTextColor',
	} as MetadataField<string>;
	readonly 'sendExact': MetadataField<CampaignSendExactType> = {
		name: 'sendExact',
		maxSelected: 1,
		minSelected: 0,
		options: { true: { en: 'Yes', pt_BR: 'Sim' }, false: { en: 'No', pt_BR: 'Não' } },
		renderAs: 'without_scroll',
		type: 'picklist',
		isSortable: true,
		label: { en: 'Send Leads to Exact Sales', pt_BR: 'Envio de Leads para Exact Sales' },
	} as MetadataField<CampaignSendExactType>;
	readonly 'firstTouchTemplate': MetadataField<CampaignFirstTouchTemplateType> = {
		type: 'lookup',
		name: 'firstTouchTemplate',
		label: { en: 'First touch template', pt_BR: 'Modelo de email' },
		isSortable: true,
		document: 'Template',
		descriptionFields: ['code', 'name'],
	} as MetadataField<CampaignFirstTouchTemplateType>;
	readonly 'firstTouchFile': MetadataField<FileDescriptor> = {
		type: 'file',
		name: 'firstTouchFile',
		label: { en: 'First Touch Attachment', pt_BR: 'Anexo Boas Vindas' },
		wildcard: '(pdf|jpg|jpeg|png)',
		isInherited: true,
	} as MetadataField<FileDescriptor>;
	readonly 'firstTouchSender': MetadataField<CampaignFirstTouchSenderType> = {
		type: 'lookup',
		name: 'firstTouchSender',
		label: { en: 'Sender', pt_BR: 'Remetente' },
		document: 'User',
		descriptionFields: ['name', 'group.name'],
		isInherited: true,
	} as MetadataField<CampaignFirstTouchSenderType>;
	readonly 'productFilter': MetadataField<ModuleFilter<ProductFilterConditions>> = {
		type: 'filter',
		name: 'productFilter',
		label: { en: 'Product filter', pt_BR: 'Filtro de produtos' },
		document: 'Product',
		filterableFields: ['active', '_createdAt', '_createdBy', 'description', 'code', 'type', 'name', 'sale', '_user'],
		isInherited: true,
		relations: [],
	} as MetadataField<ModuleFilter<ProductFilterConditions>>;
	readonly 'badge': MetadataField<FileDescriptor> = {
		type: 'file',
		name: 'badge',
		label: { en: 'Badge', pt_BR: 'Selo' },
		wildcard: '(jpg|jpeg|png)',
		isInherited: true,
	} as MetadataField<FileDescriptor>;
	readonly 'content': MetadataField<string> = {
		type: 'text',
		name: 'content',
		label: { en: 'Markdown Content', pt_BR: 'Conteúdo Markdown' },
		isList: true,
		isInherited: true,
	} as MetadataField<string>;
}
