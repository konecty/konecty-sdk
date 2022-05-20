import { AutoNumberField, BooleanField, EmailField, LookupField, TextField } from './decorators/FieldTypes';
import { Document, DocumentConfig, KonectyDocument } from './Document';
import { Group } from './Group';
import { Email as KonectyEmail } from './types';

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

export type UserGroup = Pick<Group, '_id' | 'name'>;

export interface UserType extends KonectyDocument {
	code?: number;
	username?: string;
	emails?: KonectyEmail[];
	name?: string;
	group?: UserGroup;
	active?: boolean;
}

export class User extends Document<UserType> implements UserType {
	constructor(data?: UserType) {
		super(userConfig, data);
	}

	@AutoNumberField
	readonly code!: number;

	@TextField
	username!: string;

	@EmailField
	emails!: KonectyEmail[];

	@TextField
	name!: string;

	@LookupField<Group>({ document: new Group(), descriptionFields: ['name'] })
	group!: UserGroup;

	@BooleanField
	active?: boolean;
}

const u = new User();
