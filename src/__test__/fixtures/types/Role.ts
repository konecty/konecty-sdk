import { PickFromPath } from '@konecty/sdk/TypeUtils';
import {
	KonectyModule,
	ModuleConfig,
	KonectyDocument,
	FilterConditionValue,
	FilterConditions,
	ModuleFilter,
} from '@konecty/sdk/Module';
import { LookupMetadataField, MetadataField } from '@konecty/sdk/types/metadata';
import { KonectyClientOptions } from '@konecty/sdk/Client';
import { FieldOperators } from '@konecty/sdk/FieldOperators';
import {} from '@konecty/sdk/types';
const roleConfig: ModuleConfig = {
	name: 'Role',
	collection: 'data.Role',
	label: {
		en: 'Role',
		pt_BR: 'Papel',
	},
	plurals: {
		en: 'Roles',
		pt_BR: 'Papéis',
	},
};
export type RoleParentsType = { _id: string; name: string };
export type RoleCreatedByType = { _id: string; name: string; group: { name: unknown } };
export type RoleUpdatedByType = { _id: string; name: string; group: { name: unknown } };
export type RoleUserType = { _id: string; name: string; group: { name: unknown } };
export interface Role extends KonectyDocument<RoleUserType[], RoleCreatedByType, RoleUpdatedByType> {
	access?: object;
	admin?: boolean;
	name?: string;
	parents?: RoleParentsType[];
	_createdAt?: Date;
	_createdBy?: RoleCreatedByType;
	_updatedAt?: Date;
	_updatedBy?: RoleUpdatedByType;
	_user?: RoleUserType[];
}
export type RoleFilterConditions =
	| FilterConditions
	| FilterConditionValue<'admin', FieldOperators<'boolean'>, boolean>
	| FilterConditionValue<'name', FieldOperators<'text'>, string>
	| FilterConditionValue<'parents', FieldOperators<'lookup'>, RoleParentsType>
	| FilterConditionValue<'parents._id', FieldOperators<'lookup._id'>, string>
	| FilterConditionValue<'_createdAt', FieldOperators<'dateTime'>, Date>
	| FilterConditionValue<'_createdBy', FieldOperators<'lookup'>, RoleCreatedByType>
	| FilterConditionValue<'_createdBy._id', FieldOperators<'lookup._id'>, string>
	| FilterConditionValue<'_updatedAt', FieldOperators<'dateTime'>, Date>
	| FilterConditionValue<'_updatedBy', FieldOperators<'lookup'>, RoleUpdatedByType>
	| FilterConditionValue<'_updatedBy._id', FieldOperators<'lookup._id'>, string>
	| FilterConditionValue<'_user', FieldOperators<'lookup'>, RoleUserType>
	| FilterConditionValue<'_user._id', FieldOperators<'lookup._id'>, string>;
export type RoleSortFields = 'name' | 'parents' | '_createdAt' | '_createdBy' | '_updatedAt' | '_user';
export class RoleModule extends KonectyModule<
	Role,
	RoleFilterConditions,
	RoleSortFields,
	RoleUserType[],
	RoleCreatedByType,
	RoleUpdatedByType
> {
	constructor(clientOptions?: KonectyClientOptions) {
		super(roleConfig, clientOptions);
	}
	readonly 'access': MetadataField<object> = {
		name: 'access',
		label: { en: 'Access', pt_BR: 'Acesso' },
		type: 'json',
		isInherited: true,
	} as MetadataField<object>;
	readonly 'admin': MetadataField<boolean> = {
		label: { en: 'Administrator', pt_BR: 'Administrador' },
		type: 'boolean',
		name: 'admin',
		isInherited: true,
	} as MetadataField<boolean>;
	readonly 'name': MetadataField<string> = {
		type: 'text',
		name: 'name',
		label: { en: 'Name', pt_BR: 'Nome' },
		isRequired: true,
		isSortable: true,
		isInherited: true,
	} as MetadataField<string>;
	readonly 'parents': LookupMetadataField<RoleParentsType> = {
		isList: true,
		document: 'Role',
		descriptionFields: ['name'],
		type: 'lookup',
		name: 'parents',
		label: { en: 'Childs roles', pt_BR: 'Papéis filho' },
		isSortable: true,
		minItems: 0,
		isInherited: true,
		lookup: async (search: string) => this.lookup<RoleParentsType>('parents', search),
	} as LookupMetadataField<RoleParentsType>;
	readonly '_createdAt': MetadataField<Date> = {
		name: '_createdAt',
		label: { en: 'Created At', pt_BR: 'Criado em' },
		isSortable: true,
		type: 'dateTime',
		isInherited: true,
	} as MetadataField<Date>;
	readonly '_createdBy': LookupMetadataField<RoleCreatedByType> = {
		label: { en: 'Created by', pt_BR: 'Criado por' },
		isSortable: true,
		document: 'User',
		descriptionFields: ['name', 'group.name'],
		type: 'lookup',
		name: '_createdBy',
		isInherited: true,
		lookup: async (search: string) => this.lookup<RoleCreatedByType>('_createdBy', search),
	} as LookupMetadataField<RoleCreatedByType>;
	readonly '_updatedAt': MetadataField<Date> = {
		type: 'dateTime',
		name: '_updatedAt',
		label: { en: 'Updated At', pt_BR: 'Atualizado em' },
		isSortable: true,
		isInherited: true,
	} as MetadataField<Date>;
	readonly '_updatedBy': LookupMetadataField<RoleUpdatedByType> = {
		type: 'lookup',
		name: '_updatedBy',
		label: { en: 'Updated by', pt_BR: 'Atualizado por' },
		document: 'User',
		descriptionFields: ['name', 'group.name'],
		isInherited: true,
		lookup: async (search: string) => this.lookup<RoleUpdatedByType>('_updatedBy', search),
	} as LookupMetadataField<RoleUpdatedByType>;
	readonly '_user': LookupMetadataField<RoleUserType> = {
		isList: true,
		document: 'User',
		descriptionFields: ['name', 'group.name', 'active'],
		detailFields: ['phone', 'emails'],
		type: 'lookup',
		name: '_user',
		label: { en: 'User', pt_BR: 'Usuário' },
		isSortable: true,
		isInherited: true,
		lookup: async (search: string) => this.lookup<RoleUserType>('_user', search),
	} as LookupMetadataField<RoleUserType>;
}
