import { PickFromPath } from '@konecty/sdk/TypeUtils';
import { Module, ModuleConfig, KonectyDocument } from '@konecty/sdk/Module';
import { MetadataField } from 'types/metadata';
import { Address, Email, FileDescriptor, Phone } from '@konecty/sdk/types';
import { Group } from './Group';
import { Queue } from './Queue';
import { Role } from './Role';
const userConfig: ModuleConfig = {
	name: 'User',
	collection: 'users',
	label: {
		en: 'User',
		pt_BR: 'Usuário',
	},
	plurals: {
		en: 'Users',
		pt_BR: 'Usuários',
	},
};
export type UserGroupType = PickFromPath<Group, 'name'>;
export type UserGroupsType = PickFromPath<Group, 'name'>;
export type UserRoleType = PickFromPath<Role, 'name'>;
export type UserCreatedByType = { name: string; group: { name: unknown } };
export type UserUpdatedByType = { name: string; group: { name: unknown } };
export type UserUserType = { name: string; group: { name: unknown }; active: boolean };
export type UserTargetQueueType = PickFromPath<Queue, 'name'>;
export type UserDirectorType = { nickname: string };
export type UserLocaleType = 'pt_BR' | 'en';
export type UserStatusType = 'online' | 'away' | 'busy' | 'offline';
export type UserInductionStatusType = 'Agendado' | 'Realizado' | 'Não compareceu';
export type UserBadgeType = 'Solicitado pelo Usuário' | 'Em Produção' | 'Entregue';
export type UserRecruitedByType = 'Consultoria Haag' | 'Gerente';
export type UserBusinessCardsType = 'Entregue' | 'Solicitado pelo Usuário' | 'Em Produção';
export type UserContractType = 'Funcionário' | 'Estagiário' | 'Pendente' | 'Isento' | 'CRECI' | 'Estágio CRECI';
export type UserAutonomousType = 'Assinada' | 'Pendente';
export type UserContractStatusType = 'Assinado' | 'Pronto';
export type UserDocumentTypeType =
	| 'Prot Estágio Inscrição'
	| 'Prot Estágio Renovação'
	| 'Carteira Estágio'
	| 'Prot Inscrição Principal'
	| 'Carteira CRECI';
export type UserExitMotiveManagerType =
	| 'Outra Imobiliária'
	| 'Mudança de Ramo'
	| 'Mudança de Cidade'
	| 'Saída com o Gerente Atual'
	| 'Desentendimento com o Gerente'
	| 'Desentendimento com a Equipe'
	| 'Desentendimento com Colega'
	| 'Inadequação às normas da Empresa'
	| 'Vendas fora da Empresa'
	| 'Inadaptação ao Segmento'
	| 'Doença'
	| 'Problemas Familiares';
export type UserExitMotiveBrokerType =
	| 'Outra Imobiliária'
	| 'Mudança de Ramo'
	| 'Mudança de Cidade'
	| 'Saída com o Gerente Atual'
	| 'Desentendimento com o Gerente'
	| 'Desentendimento com a Equipe'
	| 'Desentendimento com Colega'
	| 'Inadequação às normas da Empresa'
	| 'Vendas fora da Empresa'
	| 'Inadaptação ao Segmento'
	| 'Doença'
	| 'Problemas Familiares';
export interface User extends KonectyDocument<UserUserType[], UserCreatedByType, UserUpdatedByType> {
	active: boolean;
	nickname: string;
	pictures: FileDescriptor[];
	address: Address[];
	birthdate: Date;
	code: number;
	emails: Email[];
	group: UserGroupType;
	groups: UserGroupsType[];
	admin: boolean;
	jobTitle: string;
	lastLogin: Date;
	locale: UserLocaleType;
	username: string;
	name: string;
	password: string;
	access: object;
	phone: Phone[];
	role: UserRoleType;
	sessionExpireAfterMinutes: number;
	_createdAt: Date;
	_createdBy: UserCreatedByType;
	_updatedAt: Date;
	_updatedBy: UserUpdatedByType;
	status: UserStatusType;
	_user: UserUserType[];
	targetQueue: UserTargetQueueType;
	induction: Date;
	inductionStatus: UserInductionStatusType;
	documents: FileDescriptor[];
	director: UserDirectorType;
	temporaryBadge: boolean;
	badge: UserBadgeType;
	recruitedBy: UserRecruitedByType;
	recruitmentChannel: string;
	businessCards: UserBusinessCardsType;
	contract: UserContractType;
	autonomous: UserAutonomousType;
	contractStatus: UserContractStatusType;
	cpf: string;
	canViewPhone: boolean;
	document: string;
	documentType: UserDocumentTypeType;
	documentNotes: string;
	exitMotiveManager: UserExitMotiveManagerType;
	exitMotiveBroker: UserExitMotiveBrokerType;
	expire: Date;
	fullName: string;
	type: string;
}
export class UserModule extends Module<User, UserUserType[], UserCreatedByType, UserUpdatedByType> {
	constructor() {
		super(userConfig);
	}
	readonly active: MetadataField<boolean> = {
		defaultValue: true,
		type: 'boolean',
		name: 'active',
		label: { en: 'Active', pt_BR: 'Ativo' },
		isRequired: true,
		isSortable: true,
		isInherited: true,
	} as MetadataField<boolean>;
	readonly nickname: MetadataField<string> = {
		label: { en: 'Nickname', pt_BR: 'Apelido' },
		type: 'text',
		name: 'nickname',
		isInherited: true,
	} as MetadataField<string>;
	readonly pictures: MetadataField<FileDescriptor> = {
		type: 'file',
		name: 'pictures',
		label: { en: 'Pictures', pt_BR: 'Imagens' },
		isList: true,
		wildcard: '(jpg|jpeg)',
		isInherited: true,
	} as MetadataField<FileDescriptor>;
	readonly address: MetadataField<Address> = {
		typeOptions: { Casa: { en: 'Home', pt_BR: 'Casa' }, Trabalho: { en: 'Work', pt_BR: 'Trabalho' } },
		isList: true,
		isSortable: true,
		isTypeOptionsEditable: true,
		label: { pt_BR: 'Endereço', en: 'Address' },
		name: 'address',
		type: 'address',
		isInherited: true,
	} as MetadataField<Address>;
	readonly birthdate: MetadataField<Date> = {
		label: { en: 'Birthdate', pt_BR: 'Data de Nascimento' },
		isSortable: true,
		type: 'date',
		name: 'birthdate',
		isInherited: true,
	} as MetadataField<Date>;
	readonly code: MetadataField<number> = {
		type: 'autoNumber',
		name: 'code',
		label: { en: 'Code', pt_BR: 'Código' },
		isUnique: true,
		isSortable: true,
		isInherited: true,
	} as MetadataField<number>;
	readonly emails: MetadataField<Email> = {
		isList: true,
		isSortable: true,
		label: { en: 'Email', pt_BR: 'Email' },
		name: 'emails',
		type: 'email',
		isInherited: true,
	} as MetadataField<Email>;
	readonly group: MetadataField<UserGroupType> = {
		label: { en: 'Group', pt_BR: 'Grupo' },
		isRequired: true,
		isSortable: true,
		document: 'Group',
		descriptionFields: ['name'],
		type: 'lookup',
		name: 'group',
		isInherited: true,
		inheritedFields: [
			{ fieldName: 'office', inherit: 'always' },
			{ fieldName: 'director', inherit: 'always' },
			{ fieldName: 'extension', inherit: 'until_edited' },
		],
	} as MetadataField<UserGroupType>;
	readonly groups: MetadataField<UserGroupsType> = {
		type: 'lookup',
		name: 'groups',
		label: { en: 'Extra Access Groups', pt_BR: 'Grupos de Acesso Extra' },
		isSortable: true,
		isList: true,
		document: 'Group',
		descriptionFields: ['name'],
		isInherited: true,
	} as MetadataField<UserGroupsType>;
	readonly admin: MetadataField<boolean> = {
		type: 'boolean',
		name: 'admin',
		label: { en: 'Administrator', pt_BR: 'Administrador' },
		isInherited: true,
	} as MetadataField<boolean>;
	readonly jobTitle: MetadataField<string> = {
		type: 'text',
		name: 'jobTitle',
		label: { en: 'Job Title', pt_BR: 'Cargo' },
		isSortable: true,
		normalization: 'title',
		isInherited: true,
	} as MetadataField<string>;
	readonly lastLogin: MetadataField<Date> = {
		type: 'dateTime',
		name: 'lastLogin',
		label: { en: 'Last Login', pt_BR: 'Último Login' },
		isSortable: true,
		isInherited: true,
	} as MetadataField<Date>;
	readonly locale: MetadataField<UserLocaleType> = {
		isSortable: true,
		label: { en: 'Locale', pt_BR: 'Opções Regionais' },
		options: { pt_BR: { en: 'pt_BR', pt_BR: 'pt_BR' }, en: { en: 'en', pt_BR: 'en' } },
		renderAs: 'with_scroll',
		type: 'picklist',
		isRequired: true,
		maxSelected: 1,
		minSelected: 0,
		name: 'locale',
		optionsSorter: 'asc',
		isInherited: true,
	} as MetadataField<UserLocaleType>;
	readonly username: MetadataField<string> = {
		isRequired: true,
		isSortable: true,
		isUnique: true,
		label: { pt_BR: 'Login', en: 'Login' },
		name: 'username',
		normalization: 'lower',
		type: 'text',
		isInherited: true,
	} as MetadataField<string>;
	readonly name: MetadataField<string> = {
		label: { en: 'Name', pt_BR: 'Nome' },
		isSortable: true,
		normalization: 'title',
		type: 'text',
		name: 'name',
		isInherited: true,
	} as MetadataField<string>;
	readonly password: MetadataField<string> = {
		type: 'password',
		name: 'password',
		label: { en: 'Password', pt_BR: 'Senha' },
		isRequired: false,
		isSortable: true,
		isInherited: true,
	} as MetadataField<string>;
	readonly access: MetadataField<object> = {
		type: 'json',
		name: 'access',
		label: { en: 'Access', pt_BR: 'Acesso' },
		isInherited: true,
	} as MetadataField<object>;
	readonly phone: MetadataField<Phone> = {
		name: 'phone',
		isList: true,
		isSortable: true,
		isTypeOptionsEditable: true,
		label: { en: 'Phone', pt_BR: 'Telefone' },
		type: 'phone',
		typeOptions: {
			Casa: { en: 'Home', pt_BR: 'Casa' },
			Celular: { pt_BR: 'Celular', en: 'Mobile' },
			Trabalho: { en: 'Work', pt_BR: 'Trabalho' },
			Fax: { en: 'Fax', pt_BR: 'Fax' },
		},
		minItems: 0,
		maxItems: 10,
		isInherited: true,
	} as MetadataField<Phone>;
	readonly role: MetadataField<UserRoleType> = {
		descriptionFields: ['name'],
		inheritedFields: [
			{ fieldName: 'admin', inherit: 'always' },
			{ inherit: 'always', fieldName: 'access' },
		],
		type: 'lookup',
		name: 'role',
		label: { en: 'Role', pt_BR: 'Papel' },
		isRequired: true,
		isSortable: true,
		document: 'Role',
		isInherited: true,
	} as MetadataField<UserRoleType>;
	readonly sessionExpireAfterMinutes: MetadataField<number> = {
		isSortable: true,
		type: 'number',
		name: 'sessionExpireAfterMinutes',
		label: { pt_BR: 'Sessão Expirará em ', en: 'Session Expire After Minutes' },
		isInherited: true,
	} as MetadataField<number>;
	readonly _createdAt: MetadataField<Date> = {
		label: { en: 'Created At', pt_BR: 'Criado em' },
		isSortable: true,
		type: 'dateTime',
		name: '_createdAt',
		isInherited: true,
	} as MetadataField<Date>;
	readonly _createdBy: MetadataField<UserCreatedByType> = {
		type: 'lookup',
		name: '_createdBy',
		label: { en: 'Created by', pt_BR: 'Criado por' },
		isSortable: true,
		document: 'User',
		descriptionFields: ['name', 'group.name'],
		isInherited: true,
	} as MetadataField<UserCreatedByType>;
	readonly _updatedAt: MetadataField<Date> = {
		type: 'dateTime',
		name: '_updatedAt',
		label: { pt_BR: 'Atualizado em', en: 'Updated At' },
		isSortable: true,
		isInherited: true,
	} as MetadataField<Date>;
	readonly _updatedBy: MetadataField<UserUpdatedByType> = {
		label: { en: 'Updated by', pt_BR: 'Atualizado por' },
		document: 'User',
		descriptionFields: ['name', 'group.name'],
		type: 'lookup',
		name: '_updatedBy',
		isInherited: true,
	} as MetadataField<UserUpdatedByType>;
	readonly status: MetadataField<UserStatusType> = {
		type: 'picklist',
		name: 'status',
		label: { en: 'Status', pt_BR: 'Situação' },
		options: {
			online: { en: 'Online', pt_BR: 'Online', sort: 1 },
			away: { en: 'Away', pt_BR: 'Ausente', sort: 2 },
			busy: { en: 'Busy', pt_BR: 'Ocupado', sort: 3 },
			offline: { en: 'Offline', pt_BR: 'Desconectado', sort: 4 },
		},
		renderAs: 'without_scroll',
		minSelected: 0,
		maxSelected: 1,
		optionsSorter: 'sort',
		isSortable: true,
		isInherited: true,
	} as MetadataField<UserStatusType>;
	readonly _user: MetadataField<UserUserType> = {
		descriptionFields: ['name', 'group.name', 'active'],
		detailFields: ['phone', 'emails'],
		type: 'lookup',
		name: '_user',
		label: { en: 'User', pt_BR: 'Usuário' },
		isSortable: true,
		isList: true,
		document: 'User',
		isInherited: true,
	} as MetadataField<UserUserType>;
	readonly targetQueue: MetadataField<UserTargetQueueType> = {
		type: 'lookup',
		name: 'targetQueue',
		label: { en: 'Target Queue', pt_BR: 'Roleta' },
		isSortable: true,
		document: 'Queue',
		descriptionFields: ['name'],
	} as MetadataField<UserTargetQueueType>;
	readonly induction: MetadataField<Date> = {
		type: 'date',
		name: 'induction',
		label: { pt_BR: 'Integração', en: 'Induction' },
	} as MetadataField<Date>;
	readonly inductionStatus: MetadataField<UserInductionStatusType> = {
		name: 'inductionStatus',
		optionsSorter: 'asc',
		maxSelected: 1,
		minSelected: 0,
		options: {
			Agendado: { en: 'Scheduled', pt_BR: 'Agendado' },
			Realizado: { en: 'Done', pt_BR: 'Realizado' },
			'Não compareceu': { pt_BR: 'Não compareceu', en: 'Missed' },
		},
		renderAs: 'with_scroll',
		type: 'picklist',
		isSortable: true,
		label: { en: 'Induction Status', pt_BR: 'Situação da Integração' },
	} as MetadataField<UserInductionStatusType>;
	readonly documents: MetadataField<FileDescriptor> = {
		type: 'file',
		name: 'documents',
		label: { en: 'Documents', pt_BR: 'Documentação' },
		isList: true,
	} as MetadataField<FileDescriptor>;
	readonly director: MetadataField<UserDirectorType> = {
		label: { en: 'Director', pt_BR: 'Diretor' },
		isSortable: true,
		document: 'User',
		descriptionFields: ['nickname'],
		detailFields: ['emails', 'phone'],
		inheritedFields: [{ fieldName: 'targetQueue', inherit: 'always' }],
		access: 'Directors',
		type: 'lookup',
		name: 'director',
	} as MetadataField<UserDirectorType>;
	readonly temporaryBadge: MetadataField<boolean> = {
		name: 'temporaryBadge',
		label: { en: 'Temporary Badge', pt_BR: 'Crachá Provisório' },
		isRequired: true,
		isSortable: true,
		type: 'boolean',
	} as MetadataField<boolean>;
	readonly badge: MetadataField<UserBadgeType> = {
		renderAs: 'with_scroll',
		type: 'picklist',
		label: { en: 'Badge', pt_BR: 'Crachá' },
		maxSelected: 1,
		name: 'badge',
		options: {
			'Solicitado pelo Usuário': { en: 'Requested by User', pt_BR: 'Solicitado pelo Usuário' },
			'Em Produção': { en: 'In Production', pt_BR: 'Em Produção' },
			Entregue: { pt_BR: 'Entregue', en: 'Delivered' },
		},
	} as MetadataField<UserBadgeType>;
	readonly recruitedBy: MetadataField<UserRecruitedByType> = {
		name: 'recruitedBy',
		options: {
			'Consultoria Haag': { en: 'Haag Consulting', pt_BR: 'Consultoria Haag' },
			Gerente: { en: 'Manager', pt_BR: 'Gerente' },
		},
		optionsSorter: 'asc',
		renderAs: 'with_scroll',
		type: 'picklist',
		label: { en: 'Recruited By', pt_BR: 'Setor Captação' },
		maxSelected: 1,
	} as MetadataField<UserRecruitedByType>;
	readonly recruitmentChannel: MetadataField<string> = {
		type: 'text',
		name: 'recruitmentChannel',
		label: { en: 'Recruitment Channel', pt_BR: 'Canal' },
	} as MetadataField<string>;
	readonly businessCards: MetadataField<UserBusinessCardsType> = {
		maxSelected: 1,
		name: 'businessCards',
		options: {
			Entregue: { en: 'Delivered', pt_BR: 'Entregue' },
			'Solicitado pelo Usuário': { en: 'Requested by User', pt_BR: 'Solicitado pelo Usuário' },
			'Em Produção': { en: 'In Production', pt_BR: 'Em Produção' },
		},
		renderAs: 'with_scroll',
		type: 'picklist',
		label: { en: 'Business Cards', pt_BR: 'Cartão de Visita' },
	} as MetadataField<UserBusinessCardsType>;
	readonly contract: MetadataField<UserContractType> = {
		maxSelected: 1,
		name: 'contract',
		options: {
			Funcionário: { en: 'Employee', pt_BR: 'Funcionário' },
			Estagiário: { en: 'Trainee', pt_BR: 'Estagiário' },
			Pendente: { en: 'Pending', pt_BR: 'Pendente' },
			Isento: { en: 'Exempt', pt_BR: 'Isento' },
			CRECI: { en: 'CRECI', pt_BR: 'CRECI' },
			'Estágio CRECI': { pt_BR: 'Estágio CRECI', en: 'CRECI Internship' },
		},
		renderAs: 'with_scroll',
		type: 'picklist',
		label: { en: 'Employment Status', pt_BR: 'Situação de Trabalho' },
	} as MetadataField<UserContractType>;
	readonly autonomous: MetadataField<UserAutonomousType> = {
		maxSelected: 1,
		name: 'autonomous',
		options: { Assinada: { en: 'Signed', pt_BR: 'Assinada' }, Pendente: { pt_BR: 'Pendente', en: 'Pending' } },
		renderAs: 'with_scroll',
		type: 'picklist',
		label: { en: 'Autonomous Declaration', pt_BR: 'Declaração de Autônomo' },
	} as MetadataField<UserAutonomousType>;
	readonly contractStatus: MetadataField<UserContractStatusType> = {
		optionsSorter: 'asc',
		renderAs: 'with_scroll',
		type: 'picklist',
		label: { en: 'Contract Status', pt_BR: 'Situação do Contrato' },
		maxSelected: 1,
		minSelected: 0,
		name: 'contractStatus',
		options: { Assinado: { en: 'Signed', pt_BR: 'Assinado' }, Pronto: { en: 'Ready', pt_BR: 'Pronto' } },
	} as MetadataField<UserContractStatusType>;
	readonly cpf: MetadataField<string> = {
		type: 'text',
		name: 'cpf',
		label: { en: 'CPF', pt_BR: 'CPF' },
	} as MetadataField<string>;
	readonly canViewPhone: MetadataField<boolean> = {
		name: 'canViewPhone',
		label: { en: 'Can View Phone', pt_BR: 'Pode Visualizar Telefone' },
		type: 'boolean',
	} as MetadataField<boolean>;
	readonly document: MetadataField<string> = {
		type: 'text',
		name: 'document',
		label: { en: 'Document', pt_BR: 'Documento' },
	} as MetadataField<string>;
	readonly documentType: MetadataField<UserDocumentTypeType> = {
		label: { en: 'Document Type', pt_BR: 'Tipo do Documento' },
		maxSelected: 1,
		name: 'documentType',
		options: {
			'Prot Estágio Inscrição': { pt_BR: 'Prot. Estágio Inscrição', en: 'Internship Inscription Protocol' },
			'Prot Estágio Renovação': { en: 'Internship Renovation Protocol', pt_BR: 'Prot. Estágio Renovação' },
			'Carteira Estágio': { en: 'Internship Number', pt_BR: 'Carteira Estágio' },
			'Prot Inscrição Principal': { pt_BR: 'Prot. Inscrição Principal', en: 'Main Inscription Protocol' },
			'Carteira CRECI': { en: 'CRECI Number', pt_BR: 'Carteira CRECI' },
		},
		renderAs: 'with_scroll',
		type: 'picklist',
	} as MetadataField<UserDocumentTypeType>;
	readonly documentNotes: MetadataField<string> = {
		type: 'text',
		name: 'documentNotes',
		label: { en: 'Document Notes', pt_BR: 'Observação do Documento' },
	} as MetadataField<string>;
	readonly exitMotiveManager: MetadataField<UserExitMotiveManagerType> = {
		type: 'picklist',
		name: 'exitMotiveManager',
		label: { en: 'Exit Motive Managaer', pt_BR: 'Motivo da Saída (Solicitação do Gerente)' },
		maxSelected: 1,
		options: {
			'Outra Imobiliária': { pt_BR: 'Outra Imobiliária' },
			'Mudança de Ramo': { pt_BR: 'Mudança de Ramo' },
			'Mudança de Cidade': { pt_BR: 'Mudança de Cidade' },
			'Saída com o Gerente Atual': { pt_BR: 'Saída com o Gerente Atual' },
			'Desentendimento com o Gerente': { pt_BR: 'Desentendimento com o Gerente' },
			'Desentendimento com a Equipe': { pt_BR: 'Desentendimento com a Equipe' },
			'Desentendimento com Colega': { pt_BR: 'Desentendimento com Colega' },
			'Inadequação às normas da Empresa': { pt_BR: 'Inadequação às normas da Empresa' },
			'Vendas fora da Empresa': { pt_BR: 'Vendas fora da Empresa' },
			'Inadaptação ao Segmento': { pt_BR: 'Inadaptação ao Segmento' },
			Doença: { pt_BR: 'Doença' },
			'Problemas Familiares': { pt_BR: 'Problemas Familiares' },
		},
	} as MetadataField<UserExitMotiveManagerType>;
	readonly exitMotiveBroker: MetadataField<UserExitMotiveBrokerType> = {
		type: 'picklist',
		name: 'exitMotiveBroker',
		label: { en: 'Exit Motive Managaer', pt_BR: 'Motivo da Saída (Solicitação do Corretor)' },
		maxSelected: 1,
		options: {
			'Outra Imobiliária': { pt_BR: 'Outra Imobiliária' },
			'Mudança de Ramo': { pt_BR: 'Mudança de Ramo' },
			'Mudança de Cidade': { pt_BR: 'Mudança de Cidade' },
			'Saída com o Gerente Atual': { pt_BR: 'Saída com o Gerente Atual' },
			'Desentendimento com o Gerente': { pt_BR: 'Desentendimento com o Gerente' },
			'Desentendimento com a Equipe': { pt_BR: 'Desentendimento com a Equipe' },
			'Desentendimento com Colega': { pt_BR: 'Desentendimento com Colega' },
			'Inadequação às normas da Empresa': { pt_BR: 'Inadequação às normas da Empresa' },
			'Vendas fora da Empresa': { pt_BR: 'Vendas fora da Empresa' },
			'Inadaptação ao Segmento': { pt_BR: 'Inadaptação ao Segmento' },
			Doença: { pt_BR: 'Doença' },
			'Problemas Familiares': { pt_BR: 'Problemas Familiares' },
		},
	} as MetadataField<UserExitMotiveBrokerType>;
	readonly expire: MetadataField<Date> = {
		type: 'date',
		name: 'expire',
		label: { en: 'Expire', pt_BR: 'Validade' },
	} as MetadataField<Date>;
	readonly fullName: MetadataField<string> = {
		type: 'text',
		name: 'fullName',
		label: { en: 'Full Name', pt_BR: 'Nome Completo' },
		isSortable: true,
		normalization: 'title',
	} as MetadataField<string>;
	readonly type: MetadataField<string> = {
		label: { en: 'Type', pt_BR: 'Tipo' },
		type: 'text',
		name: 'type',
		defaultValue: 'user',
	} as MetadataField<string>;
}
