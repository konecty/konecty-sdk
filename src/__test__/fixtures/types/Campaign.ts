import { PickFromPath } from '@konecty/sdk/TypeUtils';
import { Document, DocumentConfig, KonectyDocument } from '@konecty/sdk/Document';
import { FieldOptions, FileDescriptor, Filter, Phone } from '@konecty/sdk/types';
import {
	AutoNumberField,
	DateTimeField,
	FileField,
	FilterField,
	LookupField,
	PhoneField,
	PicklistField,
	RichTextField,
	TextField,
} from '@konecty/sdk/decorators/FieldTypes';
import { Contact } from './Contact';
import { Product } from './Product';
import { Queue } from './Queue';
import { Template } from './Template';
import { User } from './User';
import { WebElement } from './WebElement';
const campaignConfig: DocumentConfig = {
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
export type CampaignMainCampaignType = PickFromPath<Campaign, 'code' | 'name'>;
export type CampaignCreatedByType = PickFromPath<User, 'name' | 'group.name'>;
export type CampaignUpdatedByType = PickFromPath<User, 'name' | 'group.name'>;
export type CampaignUserType = PickFromPath<User, 'name' | 'group.name' | 'active'>;
export type CampaignProductsType = PickFromPath<Product, 'code' | 'name'>;
export type CampaignWebElementType = PickFromPath<WebElement, 'code' | 'name' | 'type'>;
export type CampaignProductType = PickFromPath<Product, 'code' | 'name'>;
export type CampaignTargetQueueType = PickFromPath<Queue, 'name'>;
export type CampaignChatQueueType = PickFromPath<Queue, 'name'>;
export type CampaignFirstTouchTemplateType = PickFromPath<Template, 'code' | 'name'>;
export type CampaignFirstTouchSenderType = PickFromPath<User, 'name' | 'group.name'>;
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
const statusOptions: FieldOptions = {
	Nova: { en: 'New', pt_BR: 'Nova' },
	'Em Andamento': { en: 'In Progress', pt_BR: 'Em Andamento' },
	Concluída: { en: 'Completed', pt_BR: 'Concluída' },
	Cancelada: { pt_BR: 'Cancelada', en: 'Canceled' },
} as FieldOptions;
const typeOptions: FieldOptions = {
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
} as FieldOptions;
const sendExactOptions: FieldOptions = { true: { en: 'Yes', pt_BR: 'Sim' }, false: { en: 'No', pt_BR: 'Não' } } as FieldOptions;
export interface CampaignType extends KonectyDocument {
	mainCampaign: CampaignMainCampaignType;
	campaignTarget: Filter<Contact>;
	campaignUser: Filter<User>;
	attachment: FileDescriptor[];
	code: number;
	description: string;
	email: string;
	endAt: Date;
	name: string;
	script: string;
	startAt: Date;
	status: CampaignStatusType;
	type: CampaignTypeType;
	_createdAt: Date;
	_createdBy: CampaignCreatedByType;
	_updatedAt: Date;
	_updatedBy: CampaignUpdatedByType;
	_user: CampaignUserType[];
	identifier: string;
	externalIdentifier: string[];
	phone: Phone[];
	notes: string;
	products: CampaignProductsType[];
	webElement: CampaignWebElementType;
	product: CampaignProductType;
	targetQueue: CampaignTargetQueueType;
	chatQueue: CampaignChatQueueType;
	chatTipTitle: string;
	chatTipDescription: string;
	chatTitle: string;
	chatTitleBarColor: string;
	chatTitleBarTextColor: string;
	sendExact: CampaignSendExactType;
	firstTouchTemplate: CampaignFirstTouchTemplateType;
	firstTouchFile: FileDescriptor;
	firstTouchSender: CampaignFirstTouchSenderType;
	productFilter: Filter<Product>;
	badge: FileDescriptor;
	content: string[];
}
export class Campaign extends Document<CampaignType> implements CampaignType {
	constructor(data?: CampaignType) {
		super(campaignConfig, data);
	}
	@LookupField<Campaign>({ document: new Campaign(), descriptionFields: ['code', 'name'] })
	mainCampaign!: CampaignMainCampaignType;
	@FilterField
	campaignTarget!: Filter<Contact>;
	@FilterField
	campaignUser!: Filter<User>;
	@FileField
	attachment!: FileDescriptor[];
	@AutoNumberField
	code!: number;
	@RichTextField
	description!: string;
	@RichTextField
	email!: string;
	@DateTimeField
	endAt!: Date;
	@TextField
	name!: string;
	@RichTextField
	script!: string;
	@DateTimeField
	startAt!: Date;
	@PicklistField({ options: statusOptions })
	status!: CampaignStatusType;
	@PicklistField({ options: typeOptions })
	type!: CampaignTypeType;
	@DateTimeField
	_createdAt!: Date;
	@LookupField<User>({ document: new User(), descriptionFields: ['name', 'group.name'] })
	_createdBy!: CampaignCreatedByType;
	@DateTimeField
	_updatedAt!: Date;
	@LookupField<User>({ document: new User(), descriptionFields: ['name', 'group.name'] })
	_updatedBy!: CampaignUpdatedByType;
	@LookupField<User>({ document: new User(), descriptionFields: ['name', 'group.name', 'active'] })
	_user!: CampaignUserType[];
	@TextField
	identifier!: string;
	@TextField
	externalIdentifier!: string[];
	@PhoneField
	phone!: Phone[];
	@TextField
	notes!: string;
	@LookupField<Product>({ document: new Product(), descriptionFields: ['code', 'name'] })
	products!: CampaignProductsType[];
	@LookupField<WebElement>({ document: new WebElement(), descriptionFields: ['code', 'name', 'type'] })
	webElement!: CampaignWebElementType;
	@LookupField<Product>({ document: new Product(), descriptionFields: ['code', 'name'] })
	product!: CampaignProductType;
	@LookupField<Queue>({ document: new Queue(), descriptionFields: ['name'] })
	targetQueue!: CampaignTargetQueueType;
	@LookupField<Queue>({ document: new Queue(), descriptionFields: ['name'] })
	chatQueue!: CampaignChatQueueType;
	@TextField
	chatTipTitle!: string;
	@TextField
	chatTipDescription!: string;
	@TextField
	chatTitle!: string;
	@TextField
	chatTitleBarColor!: string;
	@TextField
	chatTitleBarTextColor!: string;
	@PicklistField({ options: sendExactOptions })
	sendExact!: CampaignSendExactType;
	@LookupField<Template>({ document: new Template(), descriptionFields: ['code', 'name'] })
	firstTouchTemplate!: CampaignFirstTouchTemplateType;
	@FileField
	firstTouchFile!: FileDescriptor;
	@LookupField<User>({ document: new User(), descriptionFields: ['name', 'group.name'] })
	firstTouchSender!: CampaignFirstTouchSenderType;
	@FilterField
	productFilter!: Filter<Product>;
	@FileField
	badge!: FileDescriptor;
	@TextField
	content!: string[];
}
