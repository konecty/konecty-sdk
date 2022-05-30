import { PickFromPath } from '@konecty/sdk/TypeUtils';
import { KonectyModule, ModuleConfig, KonectyDocument, FilterConditionValue, FilterConditions } from '@konecty/sdk/Module';
import { MetadataField } from 'types/metadata';
import { KonectyClientOptions } from 'lib/KonectyClient';
import { FieldOperators } from '@konecty/sdk/FieldOperators';
import { Address, Email, FileDescriptor, PersonName, Phone } from '@konecty/sdk/types';
import { Campaign } from './Campaign';
import { Channel } from './Channel';
import { Queue } from './Queue';
const contactConfig: ModuleConfig = {
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
export type ContactMainContactType = { code: number; name: { full: unknown } };
export type ContactQueueType = PickFromPath<Queue, 'name'>;
export type ContactCampaignType = PickFromPath<Campaign, 'code' | 'name' | 'type'>;
export type ContactStaffType = { code: number; name: { full: unknown } };
export type ContactCreatedByType = { name: PersonName; group: { name: unknown } };
export type ContactUpdatedByType = { name: PersonName; group: { name: unknown } };
export type ContactUserType = { name: PersonName; group: { name: unknown } };
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
export interface Contact extends KonectyDocument<ContactUserType[], ContactCreatedByType, ContactUpdatedByType> {
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
export type ContactFilterConditions =
	| FilterConditions
	| FilterConditionValue<'mainContact', FieldOperators<'lookup'>, ContactMainContactType>
	| FilterConditionValue<'mainContact._id', FieldOperators<'lookup._id'>, ContactMainContactType>
	| FilterConditionValue<'contactAttempts', FieldOperators<'number'>, number>
	| FilterConditionValue<'invalidAttempts', FieldOperators<'number'>, number>
	| FilterConditionValue<'description', FieldOperators<'text'>, string>
	| FilterConditionValue<'priority', FieldOperators<'picklist'>, ContactPriorityType>
	| FilterConditionValue<'queue', FieldOperators<'lookup'>, ContactQueueType>
	| FilterConditionValue<'queue._id', FieldOperators<'lookup._id'>, ContactQueueType>
	| FilterConditionValue<'campaign', FieldOperators<'lookup'>, ContactCampaignType>
	| FilterConditionValue<'campaign._id', FieldOperators<'lookup._id'>, ContactCampaignType>
	| FilterConditionValue<'referrerURL', FieldOperators<'url'>, string>
	| FilterConditionValue<'doNotCall', FieldOperators<'picklist'>, ContactDoNotCallType>
	| FilterConditionValue<'staff', FieldOperators<'lookup'>, ContactStaffType>
	| FilterConditionValue<'staff._id', FieldOperators<'lookup._id'>, ContactStaffType>
	| FilterConditionValue<'type', FieldOperators<'picklist'>, ContactTypeType>
	| FilterConditionValue<'address.country', FieldOperators<'address.country'>, string>
	| FilterConditionValue<'address.state', FieldOperators<'address.state'>, string>
	| FilterConditionValue<'address.city', FieldOperators<'address.city'>, string>
	| FilterConditionValue<'address.district', FieldOperators<'address.district'>, string>
	| FilterConditionValue<'address.place', FieldOperators<'address.place'>, string>
	| FilterConditionValue<'address.number', FieldOperators<'address.number'>, string>
	| FilterConditionValue<'address.postalCode', FieldOperators<'address.postalCode'>, string>
	| FilterConditionValue<'address.complement', FieldOperators<'address.complement'>, string>
	| FilterConditionValue<'address.geolocation.0', FieldOperators<'address.geolocation.0'>, number>
	| FilterConditionValue<'address.geolocation.1', FieldOperators<'address.geolocation.1'>, number>
	| FilterConditionValue<'password', FieldOperators<'encrypted'>, string>
	| FilterConditionValue<'birthdate', FieldOperators<'date'>, Date>
	| FilterConditionValue<'code', FieldOperators<'autoNumber'>, number>
	| FilterConditionValue<'email.address', FieldOperators<'email.address'>, string>
	| FilterConditionValue<'emailFrequence', FieldOperators<'picklist'>, ContactEmailFrequenceType>
	| FilterConditionValue<'legalPerson', FieldOperators<'boolean'>, boolean>
	| FilterConditionValue<'mailFrequence', FieldOperators<'picklist'>, ContactMailFrequenceType>
	| FilterConditionValue<'name.first', FieldOperators<'personName.first'>, string>
	| FilterConditionValue<'name.last', FieldOperators<'personName.last'>, string>
	| FilterConditionValue<'name.full', FieldOperators<'personName.full'>, string>
	| FilterConditionValue<'verificationToken', FieldOperators<'text'>, string>
	| FilterConditionValue<'notes', FieldOperators<'text'>, string>
	| FilterConditionValue<'phone.phoneNumber', FieldOperators<'phone.phoneNumber'>, string>
	| FilterConditionValue<'phone.countryCode', FieldOperators<'phone.countryCode'>, string>
	| FilterConditionValue<'picture', FieldOperators<'file'>, FileDescriptor>
	| FilterConditionValue<'smsFrequence', FieldOperators<'picklist'>, ContactSmsFrequenceType>
	| FilterConditionValue<'status', FieldOperators<'picklist'>, ContactStatusType>
	| FilterConditionValue<'_createdAt', FieldOperators<'dateTime'>, Date>
	| FilterConditionValue<'_createdBy', FieldOperators<'lookup'>, ContactCreatedByType>
	| FilterConditionValue<'_createdBy._id', FieldOperators<'lookup._id'>, ContactCreatedByType>
	| FilterConditionValue<'_updatedAt', FieldOperators<'dateTime'>, Date>
	| FilterConditionValue<'_updatedBy', FieldOperators<'lookup'>, ContactUpdatedByType>
	| FilterConditionValue<'_updatedBy._id', FieldOperators<'lookup._id'>, ContactUpdatedByType>
	| FilterConditionValue<'_user', FieldOperators<'lookup'>, ContactUserType>
	| FilterConditionValue<'_user._id', FieldOperators<'lookup._id'>, ContactUserType>
	| FilterConditionValue<'medium', FieldOperators<'picklist'>, ContactMediumType>
	| FilterConditionValue<'channel', FieldOperators<'lookup'>, ContactChannelType>
	| FilterConditionValue<'channel._id', FieldOperators<'lookup._id'>, ContactChannelType>
	| FilterConditionValue<'source', FieldOperators<'lookup'>, ContactSourceType>
	| FilterConditionValue<'source._id', FieldOperators<'lookup._id'>, ContactSourceType>
	| FilterConditionValue<'campaignsAsTarget', FieldOperators<'number'>, number>
	| FilterConditionValue<'lastCampaignTargetAt', FieldOperators<'dateTime'>, Date>
	| FilterConditionValue<'lastEmailSentAt', FieldOperators<'dateTime'>, Date>
	| FilterConditionValue<'activeOpportunities', FieldOperators<'number'>, number>;
export class ContactModule extends KonectyModule<
	Contact,
	ContactFilterConditions,
	ContactUserType[],
	ContactCreatedByType,
	ContactUpdatedByType
> {
	constructor(clientOptions?: KonectyClientOptions) {
		super(contactConfig, clientOptions);
	}
	readonly mainContact: MetadataField<ContactMainContactType> = {
		label: { en: 'Main Contact', pt_BR: 'Contato Principal' },
		document: 'Contact',
		descriptionFields: ['code', 'name.full'],
		type: 'lookup',
		name: 'mainContact',
		isInherited: true,
	} as MetadataField<ContactMainContactType>;
	readonly contactAttempts: MetadataField<number> = {
		label: { en: 'Contact Attempts', pt_BR: 'Tentativas de Contato' },
		isSortable: true,
		decimalSize: 0,
		minValue: 0,
		defaultValue: 0,
		type: 'number',
		name: 'contactAttempts',
		isInherited: true,
	} as MetadataField<number>;
	readonly invalidAttempts: MetadataField<number> = {
		name: 'invalidAttempts',
		label: { en: 'Invalid Attempts', pt_BR: 'Tentativas Invalidas' },
		isSortable: true,
		decimalSize: 0,
		minValue: 0,
		defaultValue: 0,
		type: 'number',
		isInherited: true,
	} as MetadataField<number>;
	readonly description: MetadataField<string> = {
		name: 'description',
		label: { en: 'Description', pt_BR: 'Descrição' },
		type: 'text',
		isInherited: true,
	} as MetadataField<string>;
	readonly priority: MetadataField<ContactPriorityType> = {
		name: 'priority',
		maxSelected: 1,
		minSelected: 0,
		options: {
			Alta: { en: 'High', pt_BR: 'Alta' },
			Média: { en: 'Medium', pt_BR: 'Média' },
			Baixa: { en: 'Low', pt_BR: 'Baixa' },
		},
		renderAs: 'with_scroll',
		type: 'picklist',
		isSortable: true,
		label: { pt_BR: 'Prioridade', en: 'Priority' },
		isInherited: true,
	} as MetadataField<ContactPriorityType>;
	readonly queue: MetadataField<ContactQueueType> = {
		type: 'lookup',
		name: 'queue',
		label: { en: 'Queue', pt_BR: 'Roleta' },
		document: 'Queue',
		descriptionFields: ['name'],
		isInherited: true,
	} as MetadataField<ContactQueueType>;
	readonly campaign: MetadataField<ContactCampaignType> = {
		document: 'Campaign',
		descriptionFields: ['code', 'name', 'type'],
		type: 'lookup',
		name: 'campaign',
		label: { en: 'Campaign', pt_BR: 'Campanha' },
		isSortable: true,
		isInherited: true,
	} as MetadataField<ContactCampaignType>;
	readonly referrerURL: MetadataField<string> = {
		name: 'referrerURL',
		label: { en: 'Referrer URL', pt_BR: 'Referrer URL' },
		type: 'url',
		isInherited: true,
	} as MetadataField<string>;
	readonly facebookData: MetadataField<object> = {
		label: { en: 'Facebook Data', pt_BR: 'Dados do Facebook' },
		type: 'json',
		name: 'facebookData',
		isInherited: true,
	} as MetadataField<object>;
	readonly googleData: MetadataField<object> = {
		type: 'json',
		name: 'googleData',
		label: { en: 'Google Data', pt_BR: 'Dados do Google' },
		isInherited: true,
	} as MetadataField<object>;
	readonly doNotCall: MetadataField<ContactDoNotCallType> = {
		type: 'picklist',
		label: { pt_BR: 'Não Telefonar', en: 'Do Not Call' },
		maxSelected: 3,
		minSelected: 0,
		name: 'doNotCall',
		options: {
			Noite: { en: 'Night', pt_BR: 'Noite' },
			Manhã: { en: 'Morning', pt_BR: 'Manhã' },
			Tarde: { en: 'Afternoon', pt_BR: 'Tarde' },
		},
		optionsSorter: 'asc',
		renderAs: 'without_scroll',
		isInherited: true,
	} as MetadataField<ContactDoNotCallType>;
	readonly staff: MetadataField<ContactStaffType> = {
		isList: true,
		document: 'Contact',
		descriptionFields: ['code', 'name.full'],
		detailFields: ['phone', 'email'],
		type: 'lookup',
		name: 'staff',
		label: { en: 'Staff', pt_BR: 'Funcionários' },
		isInherited: true,
	} as MetadataField<ContactStaffType>;
	readonly type: MetadataField<ContactTypeType> = {
		name: 'type',
		options: {
			Cliente: { en: 'Client', pt_BR: 'Cliente' },
			Concorrente: { en: 'Competitor', pt_BR: 'Concorrente' },
			Fornecedor: { en: 'Provider', pt_BR: 'Fornecedor' },
			Funcionário: { pt_BR: 'Funcionário' },
			Outro: { pt_BR: 'Outro' },
			Procurador: { pt_BR: 'Procurador' },
		},
		optionsSorter: 'asc',
		renderAs: 'without_scroll',
		type: 'picklist',
		label: { en: 'Type', pt_BR: 'Tipo' },
		maxSelected: 6,
		minSelected: 0,
		isInherited: true,
		isSortable: true,
		defaultValue: ['Cliente'],
	} as MetadataField<ContactTypeType>;
	readonly address: MetadataField<Address> = {
		isList: true,
		isSortable: true,
		isTypeOptionsEditable: true,
		label: { en: 'Address', pt_BR: 'Endereço' },
		name: 'address',
		type: 'address',
		typeOptions: { Casa: { en: 'Home', pt_BR: 'Casa' }, Trabalho: { en: 'Work', pt_BR: 'Trabalho' } },
		isInherited: true,
	} as MetadataField<Address>;
	readonly password: MetadataField<string> = {
		type: 'encrypted',
		name: 'password',
		label: { en: 'Password', pt_BR: 'Senha' },
		isSortable: true,
		isInherited: true,
	} as MetadataField<string>;
	readonly birthdate: MetadataField<Date> = {
		isSortable: true,
		type: 'date',
		name: 'birthdate',
		label: { en: 'Birthdate', pt_BR: 'Data de Nascimento' },
		isInherited: true,
	} as MetadataField<Date>;
	readonly code: MetadataField<number> = {
		isUnique: true,
		isSortable: true,
		type: 'autoNumber',
		name: 'code',
		label: { pt_BR: 'Código', en: 'Code' },
		isInherited: true,
	} as MetadataField<number>;
	readonly email: MetadataField<Email> = {
		type: 'email',
		typeOptions: { Pessoal: { en: 'Personal', pt_BR: 'Pessoal' }, Trabalho: { en: 'Work', pt_BR: 'Trabalho' } },
		isList: true,
		isSortable: true,
		isTypeOptionsEditable: true,
		label: { en: 'Email', pt_BR: 'Email' },
		name: 'email',
		isInherited: true,
	} as MetadataField<Email>;
	readonly emailFrequence: MetadataField<ContactEmailFrequenceType> = {
		name: 'emailFrequence',
		optionsSorter: 'asc',
		defaultValues: [{ pt_BR: 'Dia' }],
		maxSelected: 1,
		minSelected: 0,
		renderAs: 'with_scroll',
		type: 'picklist',
		isSortable: true,
		label: { en: 'Email Frequence', pt_BR: 'Frequencia de Email' },
		options: {
			Nunca: { pt_BR: 'Nunca' },
			Dia: { pt_BR: 'Dia' },
			Semana: { pt_BR: 'Semana' },
			'Duas Semanas': { pt_BR: 'Duas Semanas' },
			Mês: { pt_BR: 'Mês' },
		},
		isInherited: true,
	} as MetadataField<ContactEmailFrequenceType>;
	readonly legalPerson: MetadataField<boolean> = {
		label: { en: 'Legal Person', pt_BR: 'Pessoa Jurídica' },
		isSortable: true,
		type: 'boolean',
		name: 'legalPerson',
		isInherited: true,
	} as MetadataField<boolean>;
	readonly mailFrequence: MetadataField<ContactMailFrequenceType> = {
		isSortable: true,
		label: { pt_BR: 'Frequencia de Correspondência', en: 'Mail Frequence' },
		options: {
			Dia: { pt_BR: 'Dia' },
			Semana: { pt_BR: 'Semana' },
			'Duas Semanas': { pt_BR: 'Duas Semanas' },
			Mês: { pt_BR: 'Mês' },
			Nunca: { pt_BR: 'Nunca' },
		},
		renderAs: 'with_scroll',
		type: 'picklist',
		defaultValues: [{ pt_BR: 'Dia' }],
		maxSelected: 1,
		minSelected: 0,
		name: 'mailFrequence',
		optionsSorter: 'asc',
		isInherited: true,
	} as MetadataField<ContactMailFrequenceType>;
	readonly name: MetadataField<PersonName> = {
		type: 'personName',
		name: 'name',
		label: { en: 'Name', pt_BR: 'Nome' },
		isRequired: true,
		isSortable: true,
		isInherited: true,
	} as MetadataField<PersonName>;
	readonly verificationToken: MetadataField<string> = {
		type: 'text',
		name: 'verificationToken',
		label: { pt_BR: 'Token de Verificação', en: 'Verification Token' },
		isSortable: true,
		isInherited: true,
	} as MetadataField<string>;
	readonly notes: MetadataField<string> = {
		type: 'text',
		name: 'notes',
		label: { en: 'Notes', pt_BR: 'Observação' },
		isInherited: true,
	} as MetadataField<string>;
	readonly phone: MetadataField<Phone> = {
		label: { en: 'Phone', pt_BR: 'Telefone' },
		name: 'phone',
		type: 'phone',
		typeOptions: {
			Casa: { en: 'Home', pt_BR: 'Casa' },
			Celular: { en: 'Mobile', pt_BR: 'Celular' },
			Trabalho: { en: 'Work', pt_BR: 'Trabalho' },
			Fax: { pt_BR: 'Fax', en: 'Fax' },
		},
		isList: true,
		isSortable: true,
		isTypeOptionsEditable: true,
		isInherited: true,
	} as MetadataField<Phone>;
	readonly picture: MetadataField<FileDescriptor> = {
		label: { en: 'Picture', pt_BR: 'Imagem' },
		isSortable: true,
		isList: true,
		wildcard: '(jpg|jpeg|png)',
		maxSize: 2048,
		type: 'file',
		name: 'picture',
		isInherited: true,
	} as MetadataField<FileDescriptor>;
	readonly smsFrequence: MetadataField<ContactSmsFrequenceType> = {
		label: { en: 'SMS Frequence', pt_BR: 'Frequencia de SMS' },
		options: {
			Mês: { pt_BR: 'Mês' },
			Nunca: { pt_BR: 'Nunca' },
			Dia: { pt_BR: 'Dia' },
			Semana: { pt_BR: 'Semana' },
			'Duas Semanas': { pt_BR: 'Duas Semanas' },
		},
		renderAs: 'with_scroll',
		type: 'picklist',
		isSortable: true,
		maxSelected: 1,
		minSelected: 0,
		name: 'smsFrequence',
		optionsSorter: 'asc',
		defaultValues: [{ pt_BR: 'Dia' }],
		isInherited: true,
	} as MetadataField<ContactSmsFrequenceType>;
	readonly status: MetadataField<ContactStatusType> = {
		optionsSorter: 'sort',
		maxSelected: 1,
		minSelected: 1,
		name: 'status',
		renderAs: 'without_scroll',
		type: 'picklist',
		isSortable: true,
		label: { en: 'Status', pt_BR: 'Situação' },
		options: {
			Lead: { en: 'Lead', pt_BR: 'Lead', sort: 1 },
			Ativo: { en: 'Active', pt_BR: 'Ativo', sort: 2 },
			Faleceu: { pt_BR: 'Faleceu', en: 'Deceased', sort: 3 },
			Inválido: { en: 'Invalid', pt_BR: 'Inválido', sort: 4 },
			Descadastrado: { en: 'Unregistered', pt_BR: 'Descadastrado', sort: 5 },
			Duplicado: { en: 'Duplicate', pt_BR: 'Duplicado' },
			Inativo: { en: 'Inactive', pt_BR: 'Inativo' },
		},
		isInherited: true,
		defaultValue: 'Lead',
	} as MetadataField<ContactStatusType>;
	readonly _createdAt: MetadataField<Date> = {
		type: 'dateTime',
		name: '_createdAt',
		label: { pt_BR: 'Criado em', en: 'Created At' },
		isSortable: true,
		isInherited: true,
	} as MetadataField<Date>;
	readonly _createdBy: MetadataField<ContactCreatedByType> = {
		label: { en: 'Created by', pt_BR: 'Criado por' },
		isSortable: true,
		document: 'User',
		descriptionFields: ['name', 'group.name'],
		type: 'lookup',
		name: '_createdBy',
		isInherited: true,
	} as MetadataField<ContactCreatedByType>;
	readonly _updatedAt: MetadataField<Date> = {
		type: 'dateTime',
		name: '_updatedAt',
		label: { en: 'Updated At', pt_BR: 'Atualizado em' },
		isSortable: true,
		isInherited: true,
	} as MetadataField<Date>;
	readonly _updatedBy: MetadataField<ContactUpdatedByType> = {
		name: '_updatedBy',
		label: { en: 'Updated by', pt_BR: 'Atualizado por' },
		document: 'User',
		descriptionFields: ['name', 'group.name'],
		type: 'lookup',
		isInherited: true,
	} as MetadataField<ContactUpdatedByType>;
	readonly _user: MetadataField<ContactUserType> = {
		isSortable: true,
		isList: true,
		document: 'User',
		descriptionFields: ['name', 'group.name', 'active'],
		detailFields: ['phone', 'emails'],
		type: 'lookup',
		name: '_user',
		label: { en: 'User', pt_BR: 'Usuário' },
		isInherited: true,
	} as MetadataField<ContactUserType>;
	readonly medium: MetadataField<ContactMediumType> = {
		label: { en: 'Medium', pt_BR: 'Mídia' },
		options: {
			'Banner Online': { en: 'Online Banner', pt_BR: 'Banner Online' },
			Panfleto: { en: 'Flyer', pt_BR: 'Panfleto' },
			Outdoor: { en: 'Outdoor', pt_BR: 'Outdoor' },
			Placa: { pt_BR: 'Placa', en: 'Sign' },
			'Post Patrocinado': { pt_BR: 'Post Patrocinado', en: 'Ads Post' },
			'Post Fanpage': { pt_BR: 'Post Fanpage', en: 'Fanpage Post' },
		},
		renderAs: 'without_scroll',
		type: 'picklist',
		isSortable: true,
		minSelected: 0,
		name: 'medium',
		maxSelected: 1,
		isInherited: true,
	} as MetadataField<ContactMediumType>;
	readonly channel: MetadataField<ContactChannelType> = {
		document: 'Channel',
		descriptionFields: ['name'],
		type: 'lookup',
		name: 'channel',
		label: { en: 'Channel', pt_BR: 'Canal' },
		isSortable: true,
		isInherited: true,
	} as MetadataField<ContactChannelType>;
	readonly source: MetadataField<ContactSourceType> = {
		document: 'Channel',
		descriptionFields: ['name'],
		type: 'lookup',
		name: 'source',
		label: { en: 'Source', pt_BR: 'Origem' },
		isSortable: true,
		isInherited: true,
	} as MetadataField<ContactSourceType>;
	readonly campaignsAsTarget: MetadataField<number> = {
		type: 'number',
		name: 'campaignsAsTarget',
		isSortable: true,
		label: { en: 'Campaigns as Target', pt_BR: 'Alvo de Campanhas' },
	} as MetadataField<number>;
	readonly lastCampaignTargetAt: MetadataField<Date> = {
		type: 'dateTime',
		name: 'lastCampaignTargetAt',
		isSortable: true,
		label: { en: 'Last Campaign Target at', pt_BR: 'Último Alvo de Campanha em' },
	} as MetadataField<Date>;
	readonly lastEmailSentAt: MetadataField<Date> = {
		type: 'dateTime',
		name: 'lastEmailSentAt',
		isSortable: true,
		label: { en: 'Last Email Sent at', pt_BR: 'Último Email Enviado em' },
	} as MetadataField<Date>;
	readonly activeOpportunities: MetadataField<number> = {
		type: 'number',
		name: 'activeOpportunities',
		isSortable: true,
		label: { en: 'Active Opportunities', pt_BR: 'Oportunidades Ativas' },
		minValue: 0,
	} as MetadataField<number>;
}
