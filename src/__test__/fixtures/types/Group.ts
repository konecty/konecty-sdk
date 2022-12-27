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
import {} from '@konecty/sdk/types';
const groupConfig: ModuleConfig = {
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
export type GroupCreatedByType = { _id: string; name: string; group: { name: unknown } };
export type GroupUpdatedByType = { _id: string; name: string; group: { name: unknown } };
export type GroupUserType = { _id: string; name: string; group: { name: unknown }; active: boolean };
export interface Group extends KonectyDocument<GroupUserType[], GroupCreatedByType, GroupUpdatedByType> {
	active?: boolean;
	name?: string;
	_createdAt?: Date;
	_createdBy?: GroupCreatedByType;
	_updatedAt?: Date;
	_updatedBy?: GroupUpdatedByType;
	_user?: GroupUserType[];
}
export type GroupFilterConditions =
	| FilterConditions
	| FilterConditionValue<'active', FieldOperators<'boolean'>, boolean>
	| FilterConditionValue<'name', FieldOperators<'text'>, string>
	| FilterConditionValue<'_createdAt', FieldOperators<'dateTime'>, Date>
	| FilterConditionValue<'_createdBy', FieldOperators<'lookup'>, GroupCreatedByType>
	| FilterConditionValue<'_createdBy._id', FieldOperators<'lookup._id'>, string>
	| FilterConditionValue<'_updatedAt', FieldOperators<'dateTime'>, Date>
	| FilterConditionValue<'_updatedBy', FieldOperators<'lookup'>, GroupUpdatedByType>
	| FilterConditionValue<'_updatedBy._id', FieldOperators<'lookup._id'>, string>
	| FilterConditionValue<'_user', FieldOperators<'lookup'>, GroupUserType>
	| FilterConditionValue<'_user._id', FieldOperators<'lookup._id'>, string>;
export type GroupSortFields = 'active' | 'name' | '_createdAt' | '_createdBy' | '_updatedAt' | '_user';
export class GroupModule extends KonectyModule<
	Group,
	GroupFilterConditions,
	GroupSortFields,
	GroupUserType[],
	GroupCreatedByType,
	GroupUpdatedByType
> {
	constructor(clientOptions?: KonectyClientOptions) {
		super(groupConfig, clientOptions);
	}
	readonly 'active': MetadataField<boolean> = {
		label: { en: 'Active', pt_BR: 'Ativo' },
		isRequired: true,
		isSortable: true,
		defaultValue: true,
		type: 'boolean',
		name: 'active',
		isInherited: true,
	} as MetadataField<boolean>;
	readonly 'name': MetadataField<string> = {
		normalization: 'upper',
		type: 'text',
		name: 'name',
		label: { en: 'Name', pt_BR: 'Nome' },
		isRequired: true,
		isUnique: true,
		isSortable: true,
		isInherited: true,
	} as MetadataField<string>;
	readonly '_createdAt': MetadataField<Date> = {
		name: '_createdAt',
		label: { en: 'Created At', pt_BR: 'Criado em' },
		isSortable: true,
		type: 'dateTime',
		isInherited: true,
	} as MetadataField<Date>;
	readonly '_createdBy': MetadataField<GroupCreatedByType> = {
		document: 'User',
		descriptionFields: ['name', 'group.name'],
		type: 'lookup',
		name: '_createdBy',
		label: { en: 'Created by', pt_BR: 'Criado por' },
		isSortable: true,
		isInherited: true,
	} as MetadataField<GroupCreatedByType>;
	readonly '_updatedAt': MetadataField<Date> = {
		type: 'dateTime',
		name: '_updatedAt',
		label: { en: 'Updated At', pt_BR: 'Atualizado em' },
		isSortable: true,
		isInherited: true,
	} as MetadataField<Date>;
	readonly '_updatedBy': MetadataField<GroupUpdatedByType> = {
		type: 'lookup',
		name: '_updatedBy',
		label: { en: 'Updated by', pt_BR: 'Atualizado por' },
		document: 'User',
		descriptionFields: ['name', 'group.name'],
		isInherited: true,
	} as MetadataField<GroupUpdatedByType>;
	readonly '_user': MetadataField<GroupUserType> = {
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
