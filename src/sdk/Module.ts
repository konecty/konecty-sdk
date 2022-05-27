import 'reflect-metadata';
import { MetadataField } from 'types/metadata';
import { FieldType } from './types';
import { PickFromPath } from './TypeUtils';
import { User } from './User';

export type ModuleCreatedByType = PickFromPath<User, 'name' | 'group.name'>;
export type ModuleUpdatedByType = PickFromPath<User, 'name' | 'group.name'>;
export type ModuleUserType = PickFromPath<User, 'name' | 'group.name' | 'active'>;
export interface ModuleConfig {
	name: string;
	collection: string;
	label: {
		[key: string]: string;
	};
	plurals: {
		[key: string]: string;
	};
}

export interface KonectyDocument {
	_id: string;
	_createdAt: Date;
	_updatedAt: Date;
}

export type DocumentUser = PickFromPath<User, '_id' | 'name' | 'group.name' | 'active'>;

export abstract class Module<T> {
	#config: ModuleConfig;

	constructor(config: ModuleConfig) {
		this.#config = config;
	}

	get config(): ModuleConfig {
		return this.#config;
	}

	_id!: string;

	getType(propertyKey: string): FieldType {
		return Reflect.getMetadata('type', this, propertyKey);
	}

	readonly _user: MetadataField<ModuleUserType> = {
		descriptionFields: ['name', 'group.name', 'active'],
		detailFields: ['phone', 'emails'],
		type: 'lookup',
		name: '_user',
		label: { en: 'User', pt_BR: 'Usuário' },
		isSortable: true,
		isList: true,
		document: 'User',
		isInherited: true,
	} as MetadataField<ModuleUserType>;

	readonly _createdAt: MetadataField<Date> = {
		label: { en: 'Created At', pt_BR: 'Criado em' },
		isSortable: true,
		type: 'dateTime',
		name: '_createdAt',
		isInherited: true,
	} as MetadataField<Date>;

	readonly _createdBy: MetadataField<ModuleCreatedByType> = {
		type: 'lookup',
		name: '_createdBy',
		label: { en: 'Created by', pt_BR: 'Criado por' },
		isSortable: true,
		document: 'User',
		descriptionFields: ['name', 'group.name'],
		isInherited: true,
	} as MetadataField<ModuleCreatedByType>;

	readonly _updatedAt: MetadataField<Date> = {
		type: 'dateTime',
		name: '_updatedAt',
		label: { pt_BR: 'Atualizado em', en: 'Updated At' },
		isSortable: true,
		isInherited: true,
	} as MetadataField<Date>;

	readonly _updatedBy: MetadataField<ModuleUpdatedByType> = {
		label: { en: 'Updated by', pt_BR: 'Atualizado por' },
		document: 'User',
		descriptionFields: ['name', 'group.name'],
		type: 'lookup',
		name: '_updatedBy',
		isInherited: true,
	} as MetadataField<ModuleUpdatedByType>;
}

export type DocumentType = typeof Module.prototype;
