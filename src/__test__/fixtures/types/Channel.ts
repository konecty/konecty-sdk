import { PickFromPath } from '@konecty/sdk/TypeUtils';
import { Document, DocumentConfig, KonectyDocument } from '@konecty/sdk/Module';
import { MetadataField } from 'types/metadata';
import {} from '@konecty/sdk/types';
import { User } from './User';
const channelConfig: DocumentConfig = {
	name: 'Channel',
	collection: 'data.Channel',
	label: {
		en: 'Channel',
		pt_BR: 'Canal',
	},
	plurals: {
		en: 'Channels',
		pt_BR: 'Canais',
	},
};
export type ChannelCreatedByType = PickFromPath<User, 'name' | 'group.name'>;
export type ChannelUpdatedByType = PickFromPath<User, 'name' | 'group.name'>;
export interface Channel extends KonectyDocument {
	name: string;
	identifier: string;
	_createdAt: Date;
	_createdBy: ChannelCreatedByType;
	_updatedAt: Date;
	_updatedBy: ChannelUpdatedByType;
}
export class ChannelModule extends Document<Channel> {
	constructor() {
		super(channelConfig);
	}
	readonly name: MetadataField<string> = {
		type: 'text',
		name: 'name',
		label: { en: 'Name', pt_BR: 'Nome' },
		isRequired: true,
		isInherited: true,
	} as MetadataField<string>;
	readonly identifier: MetadataField<string> = {
		name: 'identifier',
		label: { en: 'Identifier', pt_BR: 'Identificador' },
		isSortable: true,
		type: 'text',
		isInherited: true,
	} as MetadataField<string>;
	readonly _createdAt: MetadataField<Date> = {
		type: 'dateTime',
		name: '_createdAt',
		label: { pt_BR: 'Criado em', en: 'Created At' },
		isSortable: true,
		isInherited: true,
	} as MetadataField<Date>;
	readonly _createdBy: MetadataField<ChannelCreatedByType> = {
		label: { en: 'Created by', pt_BR: 'Criado por' },
		isSortable: true,
		document: 'User',
		descriptionFields: ['name', 'group.name'],
		type: 'lookup',
		name: '_createdBy',
		isInherited: true,
	} as MetadataField<ChannelCreatedByType>;
	readonly _updatedAt: MetadataField<Date> = {
		type: 'dateTime',
		name: '_updatedAt',
		label: { en: 'Updated At', pt_BR: 'Atualizado em' },
		isSortable: true,
		isInherited: true,
	} as MetadataField<Date>;
	readonly _updatedBy: MetadataField<ChannelUpdatedByType> = {
		type: 'lookup',
		name: '_updatedBy',
		label: { en: 'Updated by', pt_BR: 'Atualizado por' },
		document: 'User',
		descriptionFields: ['name', 'group.name'],
		isInherited: true,
	} as MetadataField<ChannelUpdatedByType>;
}
