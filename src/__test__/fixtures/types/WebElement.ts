import { PickFromPath } from '@konecty/sdk/TypeUtils';
import { Document, DocumentConfig, KonectyDocument } from '@konecty/sdk/Document';
import { FieldOptions, FileDescriptor } from '@konecty/sdk/types';
import {
	AutoNumberField,
	DateTimeField,
	FileField,
	LookupField,
	NumberField,
	PicklistField,
	RichTextField,
	TextField,
} from '@konecty/sdk/decorators/FieldTypes';
import { Campaign } from './Campaign';
import { User } from './User';
const webElementConfig: DocumentConfig = {
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
export type WebElementWebElementType = PickFromPath<WebElement, 'name'>;
export type WebElementParentsType = PickFromPath<WebElement, 'name'>;
export type WebElementParentType = PickFromPath<WebElement, 'code' | 'name'>;
export type WebElementCreatedByType = PickFromPath<User, 'name' | 'group.name'>;
export type WebElementUpdatedByType = PickFromPath<User, 'name' | 'group.name'>;
export type WebElementUserType = PickFromPath<User, 'name' | 'group.name' | 'active'>;
export type WebElementLinkTargetType = '_parent' | '_blank' | '_self' | '_top';
export type WebElementPriorityType = 'Média' | 'Baixa' | 'Alta';
export type WebElementStatusType = 'Ativo' | 'Inativo';
export type WebElementTypeType = 'HTML' | 'Konecty';
const linkTargetOptions: FieldOptions = {
	_parent: { en: '_parent', pt_BR: '_parent' },
	_blank: { en: '_blank', pt_BR: '_blank' },
	_self: { en: '_self', pt_BR: '_self' },
	_top: { pt_BR: '_top', en: '_top' },
} as FieldOptions;
const priorityOptions: FieldOptions = {
	Média: { en: 'Medium', pt_BR: 'Média' },
	Baixa: { en: 'Low', pt_BR: 'Baixa' },
	Alta: { en: 'High', pt_BR: 'Alta' },
} as FieldOptions;
const statusOptions: FieldOptions = {
	Ativo: { en: 'Active', pt_BR: 'Ativo' },
	Inativo: { en: 'Inactive', pt_BR: 'Inativo' },
} as FieldOptions;
const typeOptions: FieldOptions = {
	HTML: { en: 'HTML', pt_BR: 'HTML' },
	Konecty: { en: 'Konecty', pt_BR: 'Konecty' },
} as FieldOptions;
export interface WebElementType extends KonectyDocument {
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
export class WebElement extends Document<WebElementType> implements WebElementType {
	constructor(data?: WebElementType) {
		super(webElementConfig, data);
	}
	@LookupField<Campaign>({ document: new Campaign(), descriptionFields: ['code', 'name', 'type'] })
	campaign!: WebElementCampaignType;
	@AutoNumberField
	code!: number;
	@DateTimeField
	endAt!: Date;
	@FileField
	file!: FileDescriptor[];
	@RichTextField
	html!: string[];
	@TextField
	markdown!: string[];
	@TextField
	linkLabel!: string;
	@TextField
	link!: string;
	@TextField
	slug!: string;
	@TextField
	author!: string;
	@PicklistField({ options: linkTargetOptions })
	linkTarget!: WebElementLinkTargetType;
	@TextField
	name!: string;
	@NumberField
	order!: number;
	@PicklistField({ options: priorityOptions })
	priority!: WebElementPriorityType;
	@DateTimeField
	startAt!: Date;
	@PicklistField({ options: statusOptions })
	status!: WebElementStatusType;
	@PicklistField({ options: typeOptions })
	type!: WebElementTypeType;
	@LookupField<WebElement>({ document: new WebElement(), descriptionFields: ['name'] })
	webElement!: WebElementWebElementType[];
	@LookupField<WebElement>({ document: new WebElement(), descriptionFields: ['name'] })
	parents!: WebElementParentsType[];
	@LookupField<WebElement>({ document: new WebElement(), descriptionFields: ['code', 'name'], inheritedFields: ['parents'] })
	parent!: WebElementParentType;
	@DateTimeField
	_createdAt!: Date;
	@LookupField<User>({ document: new User(), descriptionFields: ['name', 'group.name'] })
	_createdBy!: WebElementCreatedByType;
	@DateTimeField
	_updatedAt!: Date;
	@LookupField<User>({ document: new User(), descriptionFields: ['name', 'group.name'] })
	_updatedBy!: WebElementUpdatedByType;
	@LookupField<User>({ document: new User(), descriptionFields: ['name', 'group.name', 'active'] })
	_user!: WebElementUserType[];
}
