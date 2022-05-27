import { PickFromPath } from '@konecty/sdk/TypeUtils';
import { Document, DocumentConfig, KonectyDocument } from '@konecty/sdk/Module';
import { MetadataField } from 'types/metadata';
import {} from '@konecty/sdk/types';
import { User } from './User';
const groupConfig: DocumentConfig = {
	name: 'Group',
	collection: 'data.Group',
	label: {
		en: 'Group',
		pt_BR: 'Grupo',
	},
	plurals: {
		en: 'Groups',
		pt_BR: 'Grupos',
	},
};
export type GroupCreatedByType = PickFromPath<User, 'name' | 'group.name'>;
export type GroupUpdatedByType = PickFromPath<User, 'name' | 'group.name'>;
export type GroupUserType = PickFromPath<User, 'name' | 'group.name' | 'active'>;
export interface Group extends KonectyDocument {
	active: boolean;
	name: string;
	_createdAt: Date;
	_createdBy: GroupCreatedByType;
	_updatedAt: Date;
	_updatedBy: GroupUpdatedByType;
	_user: GroupUserType[];
}
export class GroupModule extends Document<Group> {
	constructor() {
		super(groupConfig);
	}
	readonly active: MetadataField<boolean> = {
		label: { en: 'Active', pt_BR: 'Ativo' },
		isRequired: true,
		isSortable: true,
		defaultValue: true,
		type: 'boolean',
		name: 'active',
		isInherited: true,
	} as MetadataField<boolean>;
	readonly name: MetadataField<string> = {
		normalization: 'upper',
		type: 'text',
		name: 'name',
		label: { en: 'Name', pt_BR: 'Nome' },
		isRequired: true,
		isUnique: true,
		isSortable: true,
		isInherited: true,
	} as MetadataField<string>;
	readonly _createdAt: MetadataField<Date> = {
		name: '_createdAt',
		label: { en: 'Created At', pt_BR: 'Criado em' },
		isSortable: true,
		type: 'dateTime',
		isInherited: true,
	} as MetadataField<Date>;
	readonly _createdBy: MetadataField<GroupCreatedByType> = {
		document: 'User',
		descriptionFields: ['name', 'group.name'],
		type: 'lookup',
		name: '_createdBy',
		label: { en: 'Created by', pt_BR: 'Criado por' },
		isSortable: true,
		isInherited: true,
	} as MetadataField<GroupCreatedByType>;
	readonly _updatedAt: MetadataField<Date> = {
		type: 'dateTime',
		name: '_updatedAt',
		label: { en: 'Updated At', pt_BR: 'Atualizado em' },
		isSortable: true,
		isInherited: true,
	} as MetadataField<Date>;
	readonly _updatedBy: MetadataField<GroupUpdatedByType> = {
		type: 'lookup',
		name: '_updatedBy',
		label: { en: 'Updated by', pt_BR: 'Atualizado por' },
		document: 'User',
		descriptionFields: ['name', 'group.name'],
		isInherited: true,
	} as MetadataField<GroupUpdatedByType>;
	readonly _user: MetadataField<GroupUserType> = {
		type: 'lookup',
		name: '_user',
		label: { en: 'User', pt_BR: 'Usuário' },
		isSortable: true,
		isList: true,
		document: 'User',
		descriptionFields: ['name', 'group.name', 'active'],
		detailFields: ['phone', 'emails'],
		isInherited: true,
	} as MetadataField<GroupUserType>;
}
