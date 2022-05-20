import { PickFromPath } from '@konecty/sdk/TypeUtils';
import { Document, DocumentConfig, KonectyDocument } from '@konecty/sdk/Document';
import { Address, Email, FieldOptions, FileDescriptor, Phone } from '@konecty/sdk/types';
import {
	AddressField,
	AutoNumberField,
	BooleanField,
	DateField,
	DateTimeField,
	EmailField,
	FileField,
	JSONField,
	LookupField,
	NumberField,
	PhoneField,
	PicklistField,
	TextField,
} from '@konecty/sdk/decorators/FieldTypes';
import { Group } from './Group';
import { Queue } from './Queue';
import { Role } from './Role';
const userConfig: DocumentConfig = {
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
export type UserCreatedByType = PickFromPath<User, 'name' | 'group.name'>;
export type UserUpdatedByType = PickFromPath<User, 'name' | 'group.name'>;
export type UserUserType = PickFromPath<User, 'name' | 'group.name' | 'active'>;
export type UserTargetQueueType = PickFromPath<Queue, 'name'>;
export type UserDirectorType = PickFromPath<User, 'nickname'>;
export type UserLocaleType = 'pt_BR' | 'en';
export type UserStatusType = 'online' | 'away' | 'busy' | 'offline';
export type UserInductionStatusType = 'Agendado' | 'Realizado' | 'Não compareceu';
export type UserBadgeType = 'Solicitado pelo Usuário' | 'Em Produção' | 'Entregue';
export type UserRecruitedByType = 'RH Foxter' | 'Consultoria Haag' | 'Gerente';
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
const localeOptions: FieldOptions = { pt_BR: { en: 'pt_BR', pt_BR: 'pt_BR' }, en: { en: 'en', pt_BR: 'en' } } as FieldOptions;
const statusOptions: FieldOptions = {
	online: { en: 'Online', pt_BR: 'Online', sort: 1 },
	away: { en: 'Away', pt_BR: 'Ausente', sort: 2 },
	busy: { en: 'Busy', pt_BR: 'Ocupado', sort: 3 },
	offline: { en: 'Offline', pt_BR: 'Desconectado', sort: 4 },
} as FieldOptions;
const inductionStatusOptions: FieldOptions = {
	Agendado: { en: 'Scheduled', pt_BR: 'Agendado' },
	Realizado: { en: 'Done', pt_BR: 'Realizado' },
	'Não compareceu': { pt_BR: 'Não compareceu', en: 'Missed' },
} as FieldOptions;
const badgeOptions: FieldOptions = {
	'Solicitado pelo Usuário': { en: 'Requested by User', pt_BR: 'Solicitado pelo Usuário' },
	'Em Produção': { en: 'In Production', pt_BR: 'Em Produção' },
	Entregue: { pt_BR: 'Entregue', en: 'Delivered' },
} as FieldOptions;
const recruitedByOptions: FieldOptions = {
	'RH Foxter': { pt_BR: 'RH Foxter', en: 'Foxter HR' },
	'Consultoria Haag': { en: 'Haag Consulting', pt_BR: 'Consultoria Haag' },
	Gerente: { en: 'Manager', pt_BR: 'Gerente' },
} as FieldOptions;
const businessCardsOptions: FieldOptions = {
	Entregue: { en: 'Delivered', pt_BR: 'Entregue' },
	'Solicitado pelo Usuário': { en: 'Requested by User', pt_BR: 'Solicitado pelo Usuário' },
	'Em Produção': { en: 'In Production', pt_BR: 'Em Produção' },
} as FieldOptions;
const contractOptions: FieldOptions = {
	Funcionário: { en: 'Employee', pt_BR: 'Funcionário' },
	Estagiário: { en: 'Trainee', pt_BR: 'Estagiário' },
	Pendente: { en: 'Pending', pt_BR: 'Pendente' },
	Isento: { en: 'Exempt', pt_BR: 'Isento' },
	CRECI: { en: 'CRECI', pt_BR: 'CRECI' },
	'Estágio CRECI': { pt_BR: 'Estágio CRECI', en: 'CRECI Internship' },
} as FieldOptions;
const autonomousOptions: FieldOptions = {
	Assinada: { en: 'Signed', pt_BR: 'Assinada' },
	Pendente: { pt_BR: 'Pendente', en: 'Pending' },
} as FieldOptions;
const contractStatusOptions: FieldOptions = {
	Assinado: { en: 'Signed', pt_BR: 'Assinado' },
	Pronto: { en: 'Ready', pt_BR: 'Pronto' },
} as FieldOptions;
const documentTypeOptions: FieldOptions = {
	'Prot Estágio Inscrição': { pt_BR: 'Prot. Estágio Inscrição', en: 'Internship Inscription Protocol' },
	'Prot Estágio Renovação': { en: 'Internship Renovation Protocol', pt_BR: 'Prot. Estágio Renovação' },
	'Carteira Estágio': { en: 'Internship Number', pt_BR: 'Carteira Estágio' },
	'Prot Inscrição Principal': { pt_BR: 'Prot. Inscrição Principal', en: 'Main Inscription Protocol' },
	'Carteira CRECI': { en: 'CRECI Number', pt_BR: 'Carteira CRECI' },
} as FieldOptions;
const exitMotiveManagerOptions: FieldOptions = {
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
} as FieldOptions;
const exitMotiveBrokerOptions: FieldOptions = {
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
} as FieldOptions;
export interface UserType extends KonectyDocument {
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
export class User extends Document<UserType> implements UserType {
	constructor(data?: UserType) {
		super(userConfig, data);
	}
	@BooleanField
	active!: boolean;
	@TextField
	nickname!: string;
	@FileField
	pictures!: FileDescriptor[];
	@AddressField
	address!: Address[];
	@DateField
	birthdate!: Date;
	@AutoNumberField
	code!: number;
	@EmailField
	emails!: Email[];
	@LookupField<Group>({
		document: new Group(),
		descriptionFields: ['name'],
		inheritedFields: ['office', 'director', 'extension'],
	})
	group!: UserGroupType;
	@LookupField<Group>({ document: new Group(), descriptionFields: ['name'] })
	groups!: UserGroupsType[];
	@BooleanField
	admin!: boolean;
	@TextField
	jobTitle!: string;
	@DateTimeField
	lastLogin!: Date;
	@PicklistField({ options: localeOptions })
	locale!: UserLocaleType;
	@TextField
	username!: string;
	@TextField
	name!: string;
	@TextField
	password!: string;
	@JSONField
	access!: object;
	@PhoneField
	phone!: Phone[];
	@LookupField<Role>({ document: new Role(), descriptionFields: ['name'], inheritedFields: ['admin', 'access'] })
	role!: UserRoleType;
	@NumberField
	sessionExpireAfterMinutes!: number;
	@DateTimeField
	_createdAt!: Date;
	@LookupField<User>({ document: new User(), descriptionFields: ['name', 'group.name'] })
	_createdBy!: UserCreatedByType;
	@DateTimeField
	_updatedAt!: Date;
	@LookupField<User>({ document: new User(), descriptionFields: ['name', 'group.name'] })
	_updatedBy!: UserUpdatedByType;
	@PicklistField({ options: statusOptions })
	status!: UserStatusType;
	@LookupField<User>({ document: new User(), descriptionFields: ['name', 'group.name', 'active'] })
	_user!: UserUserType[];
	@LookupField<Queue>({ document: new Queue(), descriptionFields: ['name'] })
	targetQueue!: UserTargetQueueType;
	@DateField
	induction!: Date;
	@PicklistField({ options: inductionStatusOptions })
	inductionStatus!: UserInductionStatusType;
	@FileField
	documents!: FileDescriptor[];
	@LookupField<User>({ document: new User(), descriptionFields: ['nickname'], inheritedFields: ['targetQueue'] })
	director!: UserDirectorType;
	@BooleanField
	temporaryBadge!: boolean;
	@PicklistField({ options: badgeOptions })
	badge!: UserBadgeType;
	@PicklistField({ options: recruitedByOptions })
	recruitedBy!: UserRecruitedByType;
	@TextField
	recruitmentChannel!: string;
	@PicklistField({ options: businessCardsOptions })
	businessCards!: UserBusinessCardsType;
	@PicklistField({ options: contractOptions })
	contract!: UserContractType;
	@PicklistField({ options: autonomousOptions })
	autonomous!: UserAutonomousType;
	@PicklistField({ options: contractStatusOptions })
	contractStatus!: UserContractStatusType;
	@TextField
	cpf!: string;
	@BooleanField
	canViewPhone!: boolean;
	@TextField
	document!: string;
	@PicklistField({ options: documentTypeOptions })
	documentType!: UserDocumentTypeType;
	@TextField
	documentNotes!: string;
	@PicklistField({ options: exitMotiveManagerOptions })
	exitMotiveManager!: UserExitMotiveManagerType;
	@PicklistField({ options: exitMotiveBrokerOptions })
	exitMotiveBroker!: UserExitMotiveBrokerType;
	@DateField
	expire!: Date;
	@TextField
	fullName!: string;
	@TextField
	type!: string;
}
