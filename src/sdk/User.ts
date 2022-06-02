import { KonectyClientOptions } from '@konecty/sdk/Client';
import { FieldOperators } from '@konecty/sdk/FieldOperators';
import { FilterConditionValue, KonectyDocument, KonectyModule, ModuleConfig } from '@konecty/sdk/Module';
import { Email, Phone } from '@konecty/sdk/types';
import { MetadataField } from '@konecty/sdk/types/metadata';
import { PickFromPath } from '@konecty/sdk/TypeUtils';
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
export type UserGroupType = { _id: string; name: string };
export type UserGroupsType = { _id: string; name: string };
export type UserRoleType = PickFromPath<Role, '_id' | 'name'>;
export type UserCreatedByType = { _id: string; name: string; group: { name: unknown } };
export type UserUpdatedByType = { _id: string; name: string; group: { name: unknown } };
export type UserUserType = { _id: string; name: string; group: { name: unknown }; active: boolean };

export type UserLocaleType = 'pt_BR' | 'en';
export interface User extends KonectyDocument<UserUserType[], UserCreatedByType, UserUpdatedByType> {
	code?: number;
	active?: boolean;
	emails?: Email[];
	group?: UserGroupType;
	groups?: UserGroupsType[];
	admin?: boolean;
	lastLogin?: Date;
	locale?: UserLocaleType;
	username?: string;
	name?: string;
	password?: string;
	access?: object;
	phone?: Phone[];
	role?: UserRoleType;
	sessionExpireAfterMinutes?: number;
	_createdAt?: Date;
	_createdBy?: UserCreatedByType;
	_updatedAt?: Date;
	_updatedBy?: UserUpdatedByType;
	_user?: UserUserType[];
	expire?: Date;
	fullName?: string;
	type?: string;
}
export type UserFilterConditions =
	| FilterConditionValue<'code', FieldOperators<'autoNumber'>, number>
	| FilterConditionValue<'active', FieldOperators<'boolean'>, boolean>
	| FilterConditionValue<'emails.address', FieldOperators<'email.address'>, string>
	| FilterConditionValue<'group', FieldOperators<'lookup'>, UserGroupType>
	| FilterConditionValue<'group._id', FieldOperators<'lookup._id'>, UserGroupType>
	| FilterConditionValue<'groups', FieldOperators<'lookup'>, UserGroupsType>
	| FilterConditionValue<'groups._id', FieldOperators<'lookup._id'>, UserGroupsType>
	| FilterConditionValue<'admin', FieldOperators<'boolean'>, boolean>
	| FilterConditionValue<'lastLogin', FieldOperators<'dateTime'>, Date>
	| FilterConditionValue<'locale', FieldOperators<'picklist'>, UserLocaleType>
	| FilterConditionValue<'username', FieldOperators<'text'>, string>
	| FilterConditionValue<'name', FieldOperators<'text'>, string>
	| FilterConditionValue<'phone.phoneNumber', FieldOperators<'phone.phoneNumber'>, string>
	| FilterConditionValue<'phone.countryCode', FieldOperators<'phone.countryCode'>, string>
	| FilterConditionValue<'role', FieldOperators<'lookup'>, UserRoleType>
	| FilterConditionValue<'role._id', FieldOperators<'lookup._id'>, UserRoleType>
	| FilterConditionValue<'sessionExpireAfterMinutes', FieldOperators<'number'>, number>
	| FilterConditionValue<'_createdAt', FieldOperators<'dateTime'>, Date>
	| FilterConditionValue<'_createdBy', FieldOperators<'lookup'>, UserCreatedByType>
	| FilterConditionValue<'_createdBy._id', FieldOperators<'lookup._id'>, UserCreatedByType>
	| FilterConditionValue<'_updatedAt', FieldOperators<'dateTime'>, Date>
	| FilterConditionValue<'_updatedBy', FieldOperators<'lookup'>, UserUpdatedByType>
	| FilterConditionValue<'_updatedBy._id', FieldOperators<'lookup._id'>, UserUpdatedByType>
	| FilterConditionValue<'_user', FieldOperators<'lookup'>, UserUserType>
	| FilterConditionValue<'_user._id', FieldOperators<'lookup._id'>, UserUserType>
	| FilterConditionValue<'expire', FieldOperators<'date'>, Date>
	| FilterConditionValue<'fullName', FieldOperators<'text'>, string>
	| FilterConditionValue<'type', FieldOperators<'text'>, string>;
export type UserSortFields =
	| 'active'
	| 'address'
	| 'code'
	| 'emails'
	| 'group'
	| 'groups'
	| 'lastLogin'
	| 'locale'
	| 'username'
	| 'name'
	| 'password'
	| 'phone'
	| 'role'
	| 'sessionExpireAfterMinutes'
	| '_createdAt'
	| '_createdBy'
	| '_updatedAt'
	| '_user'
	| 'fullName';
export class UserModule extends KonectyModule<
	User,
	UserFilterConditions,
	UserSortFields,
	UserUserType[],
	UserCreatedByType,
	UserUpdatedByType
> {
	constructor(clientOptions?: KonectyClientOptions) {
		super(userConfig, clientOptions);
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
