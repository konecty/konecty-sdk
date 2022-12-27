import { PickFromPath, UnionToIntersection } from '@konecty/sdk/TypeUtils';
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
const channelConfig: ModuleConfig = {
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
export type ChannelCreatedByType = { _id: string; name: string; group: { name: unknown } };
export type ChannelUpdatedByType = { _id: string; name: string; group: { name: unknown } };
export interface Channel extends KonectyDocument<never, ChannelCreatedByType, ChannelUpdatedByType> {
	name?: string;
	identifier?: string;
	_createdAt?: Date;
	_createdBy?: ChannelCreatedByType;
	_updatedAt?: Date;
	_updatedBy?: ChannelUpdatedByType;
}
export type ChannelFilterConditions =
	| FilterConditions
	| FilterConditionValue<'name', FieldOperators<'text'>, string>
	| FilterConditionValue<'identifier', FieldOperators<'text'>, string>
	| FilterConditionValue<'_createdAt', FieldOperators<'dateTime'>, Date>
	| FilterConditionValue<'_createdBy', FieldOperators<'lookup'>, ChannelCreatedByType>
	| FilterConditionValue<'_createdBy._id', FieldOperators<'lookup._id'>, string>
	| FilterConditionValue<'_updatedAt', FieldOperators<'dateTime'>, Date>
	| FilterConditionValue<'_updatedBy', FieldOperators<'lookup'>, ChannelUpdatedByType>
	| FilterConditionValue<'_updatedBy._id', FieldOperators<'lookup._id'>, string>;
export type ChannelSortFields = 'identifier' | '_createdAt' | '_createdBy' | '_updatedAt';
export class ChannelModule extends KonectyModule<
	Channel,
	ChannelFilterConditions,
	ChannelSortFields,
	never,
	ChannelCreatedByType,
	ChannelUpdatedByType
> {
	constructor(clientOptions?: KonectyClientOptions) {
		super(channelConfig, clientOptions);
	}
	readonly 'name': MetadataField<string> = {
		type: 'text',
		name: 'name',
		label: { en: 'Name', pt_BR: 'Nome' },
		isRequired: true,
		isInherited: true,
	} as MetadataField<string>;
	readonly 'identifier': MetadataField<string> = {
		name: 'identifier',
		label: { en: 'Identifier', pt_BR: 'Identificador' },
		isSortable: true,
		type: 'text',
		isInherited: true,
	} as MetadataField<string>;
	readonly '_createdAt': MetadataField<Date> = {
		type: 'dateTime',
		name: '_createdAt',
		label: { pt_BR: 'Criado em', en: 'Created At' },
		isSortable: true,
		isInherited: true,
	} as MetadataField<Date>;
	readonly '_createdBy': LookupMetadataField<ChannelCreatedByType> = {
		label: { en: 'Created by', pt_BR: 'Criado por' },
		isSortable: true,
		document: 'User',
		descriptionFields: ['name', 'group.name'],
		type: 'lookup',
		name: '_createdBy',
		isInherited: true,
		lookup: async (search: string) => this.lookup<ChannelCreatedByType>('_createdBy', search),
	} as LookupMetadataField<ChannelCreatedByType>;
	readonly '_updatedAt': MetadataField<Date> = {
		type: 'dateTime',
		name: '_updatedAt',
		label: { en: 'Updated At', pt_BR: 'Atualizado em' },
		isSortable: true,
		isInherited: true,
	} as MetadataField<Date>;
	readonly '_updatedBy': LookupMetadataField<ChannelUpdatedByType> = {
		type: 'lookup',
		name: '_updatedBy',
		label: { en: 'Updated by', pt_BR: 'Atualizado por' },
		document: 'User',
		descriptionFields: ['name', 'group.name'],
		isInherited: true,
		lookup: async (search: string) => this.lookup<ChannelUpdatedByType>('_updatedBy', search),
	} as LookupMetadataField<ChannelUpdatedByType>;
}
