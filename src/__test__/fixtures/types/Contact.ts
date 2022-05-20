import { PickFromPath } from '@konecty/sdk/TypeUtils';
import { Document, DocumentConfig, KonectyDocument } from '@konecty/sdk/Document';
import { Address, Email, FieldOptions, FileDescriptor, PersonName, Phone } from '@konecty/sdk/types';
import {
	AddressField,
	AutoNumberField,
	BooleanField,
	DateField,
	DateTimeField,
	EmailField,
	EncryptedField,
	FileField,
	JSONField,
	LookupField,
	NumberField,
	PersonNameField,
	PhoneField,
	PicklistField,
	TextField,
	UrlField,
} from '@konecty/sdk/decorators/FieldTypes';
import { Campaign } from './Campaign';
import { Channel } from './Channel';
import { Queue } from './Queue';
import { User } from './User';
const contactConfig: DocumentConfig = {
	name: 'Contact',
	collection: 'data.Contact',
	label: {
		en: 'Contact',
		pt_BR: 'Contato',
	},
	plurals: {
		en: 'Contacts',
		pt_BR: 'Contatos',
	},
};
export type ContactMainContactType = PickFromPath<Contact, 'code' | 'name.full'>;
export type ContactQueueType = PickFromPath<Queue, 'name'>;
export type ContactCampaignType = PickFromPath<Campaign, 'code' | 'name' | 'type'>;
export type ContactStaffType = PickFromPath<Contact, 'code' | 'name.full'>;
export type ContactCreatedByType = PickFromPath<User, 'name' | 'group.name'>;
export type ContactUpdatedByType = PickFromPath<User, 'name' | 'group.name'>;
export type ContactUserType = PickFromPath<User, 'name' | 'group.name' | 'active'>;
export type ContactChannelType = PickFromPath<Channel, 'name'>;
export type ContactSourceType = PickFromPath<Channel, 'name'>;
export type ContactPriorityType = 'Alta' | 'Média' | 'Baixa';
export type ContactDoNotCallType = 'Noite' | 'Manhã' | 'Tarde';
export type ContactTypeType = 'Cliente' | 'Concorrente' | 'Fornecedor' | 'Funcionário' | 'Outro' | 'Procurador';
export type ContactEmailFrequenceType = 'Nunca' | 'Dia' | 'Semana' | 'Duas Semanas' | 'Mês';
export type ContactMailFrequenceType = 'Dia' | 'Semana' | 'Duas Semanas' | 'Mês' | 'Nunca';
export type ContactSmsFrequenceType = 'Mês' | 'Nunca' | 'Dia' | 'Semana' | 'Duas Semanas';
export type ContactStatusType = 'Lead' | 'Ativo' | 'Faleceu' | 'Inválido' | 'Descadastrado' | 'Duplicado' | 'Inativo';
export type ContactMediumType = 'Banner Online' | 'Panfleto' | 'Outdoor' | 'Placa' | 'Post Patrocinado' | 'Post Fanpage';
const priorityOptions: FieldOptions = {
	Alta: { en: 'High', pt_BR: 'Alta' },
	Média: { en: 'Medium', pt_BR: 'Média' },
	Baixa: { en: 'Low', pt_BR: 'Baixa' },
} as FieldOptions;
const doNotCallOptions: FieldOptions = {
	Noite: { en: 'Night', pt_BR: 'Noite' },
	Manhã: { en: 'Morning', pt_BR: 'Manhã' },
	Tarde: { en: 'Afternoon', pt_BR: 'Tarde' },
} as FieldOptions;
const typeOptions: FieldOptions = {
	Cliente: { en: 'Client', pt_BR: 'Cliente' },
	Concorrente: { en: 'Competitor', pt_BR: 'Concorrente' },
	Fornecedor: { en: 'Provider', pt_BR: 'Fornecedor' },
	Funcionário: { pt_BR: 'Funcionário' },
	Outro: { pt_BR: 'Outro' },
	Procurador: { pt_BR: 'Procurador' },
} as FieldOptions;
const emailFrequenceOptions: FieldOptions = {
	Nunca: { pt_BR: 'Nunca' },
	Dia: { pt_BR: 'Dia' },
	Semana: { pt_BR: 'Semana' },
	'Duas Semanas': { pt_BR: 'Duas Semanas' },
	Mês: { pt_BR: 'Mês' },
} as FieldOptions;
const mailFrequenceOptions: FieldOptions = {
	Dia: { pt_BR: 'Dia' },
	Semana: { pt_BR: 'Semana' },
	'Duas Semanas': { pt_BR: 'Duas Semanas' },
	Mês: { pt_BR: 'Mês' },
	Nunca: { pt_BR: 'Nunca' },
} as FieldOptions;
const smsFrequenceOptions: FieldOptions = {
	Mês: { pt_BR: 'Mês' },
	Nunca: { pt_BR: 'Nunca' },
	Dia: { pt_BR: 'Dia' },
	Semana: { pt_BR: 'Semana' },
	'Duas Semanas': { pt_BR: 'Duas Semanas' },
} as FieldOptions;
const statusOptions: FieldOptions = {
	Lead: { en: 'Lead', pt_BR: 'Lead', sort: 1 },
	Ativo: { en: 'Active', pt_BR: 'Ativo', sort: 2 },
	Faleceu: { pt_BR: 'Faleceu', en: 'Deceased', sort: 3 },
	Inválido: { en: 'Invalid', pt_BR: 'Inválido', sort: 4 },
	Descadastrado: { en: 'Unregistered', pt_BR: 'Descadastrado', sort: 5 },
	Duplicado: { en: 'Duplicate', pt_BR: 'Duplicado' },
	Inativo: { en: 'Inactive', pt_BR: 'Inativo' },
} as FieldOptions;
const mediumOptions: FieldOptions = {
	'Banner Online': { en: 'Online Banner', pt_BR: 'Banner Online' },
	Panfleto: { en: 'Flyer', pt_BR: 'Panfleto' },
	Outdoor: { en: 'Outdoor', pt_BR: 'Outdoor' },
	Placa: { pt_BR: 'Placa', en: 'Sign' },
	'Post Patrocinado': { pt_BR: 'Post Patrocinado', en: 'Ads Post' },
	'Post Fanpage': { pt_BR: 'Post Fanpage', en: 'Fanpage Post' },
} as FieldOptions;
export interface ContactType extends KonectyDocument {
	mainContact: ContactMainContactType;
	contactAttempts: number;
	invalidAttempts: number;
	description: string;
	priority: ContactPriorityType;
	queue: ContactQueueType;
	campaign: ContactCampaignType;
	referrerURL: string;
	facebookData: object;
	googleData: object;
	doNotCall: ContactDoNotCallType;
	staff: ContactStaffType[];
	type: ContactTypeType;
	address: Address[];
	password: string;
	birthdate: Date;
	code: number;
	email: Email[];
	emailFrequence: ContactEmailFrequenceType;
	legalPerson: boolean;
	mailFrequence: ContactMailFrequenceType;
	name: PersonName;
	verificationToken: string;
	notes: string;
	phone: Phone[];
	picture: FileDescriptor[];
	smsFrequence: ContactSmsFrequenceType;
	status: ContactStatusType;
	_createdAt: Date;
	_createdBy: ContactCreatedByType;
	_updatedAt: Date;
	_updatedBy: ContactUpdatedByType;
	_user: ContactUserType[];
	medium: ContactMediumType;
	channel: ContactChannelType;
	source: ContactSourceType;
	campaignsAsTarget: number;
	lastCampaignTargetAt: Date;
	lastEmailSentAt: Date;
	activeOpportunities: number;
}
export class Contact extends Document<ContactType> implements ContactType {
	constructor(data?: ContactType) {
		super(contactConfig, data);
	}
	@LookupField<Contact>({ document: new Contact(), descriptionFields: ['code', 'name.full'] })
	mainContact!: ContactMainContactType;
	@NumberField
	contactAttempts!: number;
	@NumberField
	invalidAttempts!: number;
	@TextField
	description!: string;
	@PicklistField({ options: priorityOptions })
	priority!: ContactPriorityType;
	@LookupField<Queue>({ document: new Queue(), descriptionFields: ['name'] })
	queue!: ContactQueueType;
	@LookupField<Campaign>({ document: new Campaign(), descriptionFields: ['code', 'name', 'type'] })
	campaign!: ContactCampaignType;
	@UrlField
	referrerURL!: string;
	@JSONField
	facebookData!: object;
	@JSONField
	googleData!: object;
	@PicklistField({ options: doNotCallOptions })
	doNotCall!: ContactDoNotCallType;
	@LookupField<Contact>({ document: new Contact(), descriptionFields: ['code', 'name.full'] })
	staff!: ContactStaffType[];
	@PicklistField({ options: typeOptions })
	type!: ContactTypeType;
	@AddressField
	address!: Address[];
	@EncryptedField
	password!: string;
	@DateField
	birthdate!: Date;
	@AutoNumberField
	code!: number;
	@EmailField
	email!: Email[];
	@PicklistField({ options: emailFrequenceOptions })
	emailFrequence!: ContactEmailFrequenceType;
	@BooleanField
	legalPerson!: boolean;
	@PicklistField({ options: mailFrequenceOptions })
	mailFrequence!: ContactMailFrequenceType;
	@PersonNameField
	name!: PersonName;
	@TextField
	verificationToken!: string;
	@TextField
	notes!: string;
	@PhoneField
	phone!: Phone[];
	@FileField
	picture!: FileDescriptor[];
	@PicklistField({ options: smsFrequenceOptions })
	smsFrequence!: ContactSmsFrequenceType;
	@PicklistField({ options: statusOptions })
	status!: ContactStatusType;
	@DateTimeField
	_createdAt!: Date;
	@LookupField<User>({ document: new User(), descriptionFields: ['name', 'group.name'] })
	_createdBy!: ContactCreatedByType;
	@DateTimeField
	_updatedAt!: Date;
	@LookupField<User>({ document: new User(), descriptionFields: ['name', 'group.name'] })
	_updatedBy!: ContactUpdatedByType;
	@LookupField<User>({ document: new User(), descriptionFields: ['name', 'group.name', 'active'] })
	_user!: ContactUserType[];
	@PicklistField({ options: mediumOptions })
	medium!: ContactMediumType;
	@LookupField<Channel>({ document: new Channel(), descriptionFields: ['name'] })
	channel!: ContactChannelType;
	@LookupField<Channel>({ document: new Channel(), descriptionFields: ['name'] })
	source!: ContactSourceType;
	@NumberField
	campaignsAsTarget!: number;
	@DateTimeField
	lastCampaignTargetAt!: Date;
	@DateTimeField
	lastEmailSentAt!: Date;
	@NumberField
	activeOpportunities!: number;
}
