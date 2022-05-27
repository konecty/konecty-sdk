import { MetadataField } from 'types/metadata';
import { Group } from './Group';
import { KonectyDocument, Module, ModuleConfig } from './Module';
import { Email, Email as KonectyEmail } from './types';
import { PickFromPath } from './TypeUtils';
export type UserGroupType = PickFromPath<Group, 'name'>;
export type UserGroupsType = PickFromPath<Group, 'name'>;

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

export type UserGroup = Pick<Group, '_id' | 'name'>;

export interface User extends KonectyDocument {
	code?: number;
	username?: string;
	emails?: KonectyEmail[];
	name?: string;
	group?: UserGroup;
	active?: boolean;
}

export class UserModule extends Module<User> {
	constructor() {
		super(userConfig);
	}

	readonly code: MetadataField<number> = {
		type: 'autoNumber',
		name: 'code',
		label: { en: 'Code', pt_BR: 'Código' },
		isUnique: true,
		isSortable: true,
		isInherited: true,
	} as MetadataField<number>;

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

	readonly emails: MetadataField<Email> = {
		isList: true,
		isSortable: true,
		label: { en: 'Email', pt_BR: 'Email' },
		name: 'emails',
		type: 'email',
		isInherited: true,
	} as MetadataField<Email>;

	readonly name: MetadataField<string> = {
		label: { en: 'Name', pt_BR: 'Nome' },
		isSortable: true,
		normalization: 'title',
		type: 'text',
		name: 'name',
		isInherited: true,
	} as MetadataField<string>;

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

	readonly active: MetadataField<boolean> = {
		defaultValue: true,
		type: 'boolean',
		name: 'active',
		label: { en: 'Active', pt_BR: 'Ativo' },
		isRequired: true,
		isSortable: true,
		isInherited: true,
	} as MetadataField<boolean>;
}
