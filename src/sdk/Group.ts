import { AutoNumberField, BooleanField, TextField } from './decorators/FieldTypes';
import { Document, DocumentConfig, KonectyDocument } from './Document';

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

interface GroupType extends KonectyDocument {
	code?: number;
	name?: string;
	active?: boolean;
}

export class Group extends Document<GroupType> implements GroupType {
	constructor(data?: GroupType) {
		super(groupConfig, data);
	}
	@AutoNumberField
	readonly code!: number;

	@TextField
	name!: string;

	@BooleanField
	active!: boolean;
}
