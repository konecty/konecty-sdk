import { PickFromPath } from '@konecty/sdk/TypeUtils';
import { Document, DocumentConfig, KonectyDocument } from '@konecty/sdk/Document';
import {} from '@konecty/sdk/types';
import { BooleanField, DateTimeField, JSONField, LookupField, TextField } from '@konecty/sdk/decorators/FieldTypes';
import { User } from './User';
const roleConfig: DocumentConfig = {
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
export type RoleParentsType = PickFromPath<Role, 'name'>;
export type RoleCreatedByType = PickFromPath<User, 'name' | 'group.name'>;
export type RoleUpdatedByType = PickFromPath<User, 'name' | 'group.name'>;
export type RoleUserType = PickFromPath<User, 'name' | 'group.name' | 'active'>;
export interface RoleType extends KonectyDocument {
	access: object;
	admin: boolean;
	name: string;
	parents: RoleParentsType[];
	_createdAt: Date;
	_createdBy: RoleCreatedByType;
	_updatedAt: Date;
	_updatedBy: RoleUpdatedByType;
	_user: RoleUserType[];
}
export class Role extends Document<RoleType> implements RoleType {
	constructor(data?: RoleType) {
		super(roleConfig, data);
	}
	@JSONField
	access!: object;
	@BooleanField
	admin!: boolean;
	@TextField
	name!: string;
	@LookupField<Role>({ document: new Role(), descriptionFields: ['name'] })
	parents!: RoleParentsType[];
	@DateTimeField
	_createdAt!: Date;
	@LookupField<User>({ document: new User(), descriptionFields: ['name', 'group.name'] })
	_createdBy!: RoleCreatedByType;
	@DateTimeField
	_updatedAt!: Date;
	@LookupField<User>({ document: new User(), descriptionFields: ['name', 'group.name'] })
	_updatedBy!: RoleUpdatedByType;
	@LookupField<User>({ document: new User(), descriptionFields: ['name', 'group.name', 'active'] })
	_user!: RoleUserType[];
}
