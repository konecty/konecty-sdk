import { MetadataField } from 'types/metadata';
import { KonectyDocument, KonectyModule, ModuleConfig } from './Module';

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

export interface Group extends KonectyDocument {
	code?: number;
	name?: string;
	active?: boolean;
}

export class GroupModule extends KonectyModule<Group> {
	constructor() {
		super(groupConfig);
	}
	readonly code: MetadataField<number> = {
		type: 'autoNumber',
		name: 'code',
		label: { en: 'Code', pt_BR: 'Código' },
		isUnique: true,
		isSortable: true,
		isInherited: true,
	} as MetadataField<number>;

	readonly name: MetadataField<string> = {
		label: { en: 'Name', pt_BR: 'Nome' },
		isSortable: true,
		normalization: 'title',
		type: 'text',
		name: 'name',
		isInherited: true,
	} as MetadataField<string>;

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
