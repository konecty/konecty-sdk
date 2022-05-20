import { PickFromPath } from '@konecty/sdk/TypeUtils';
import { Document, DocumentConfig, KonectyDocument } from '@konecty/sdk/Document';
import {} from '@konecty/sdk/types';
import { BooleanField, DateTimeField, LookupField, TextField } from '@konecty/sdk/decorators/FieldTypes';
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
export interface GroupType extends KonectyDocument {
	active: boolean;
	name: string;
	_createdAt: Date;
	_createdBy: GroupCreatedByType;
	_updatedAt: Date;
	_updatedBy: GroupUpdatedByType;
	_user: GroupUserType[];
}
export class Group extends Document<GroupType> implements GroupType {
	constructor(data?: GroupType) {
		super(groupConfig, data);
	}
	@BooleanField
	active!: boolean;
	@TextField
	name!: string;
	@DateTimeField
	_createdAt!: Date;
	@LookupField<User>({ document: new User(), descriptionFields: ['name', 'group.name'] })
	_createdBy!: GroupCreatedByType;
	@DateTimeField
	_updatedAt!: Date;
	@LookupField<User>({ document: new User(), descriptionFields: ['name', 'group.name'] })
	_updatedBy!: GroupUpdatedByType;
	@LookupField<User>({ document: new User(), descriptionFields: ['name', 'group.name', 'active'] })
	_user!: GroupUserType[];
}
