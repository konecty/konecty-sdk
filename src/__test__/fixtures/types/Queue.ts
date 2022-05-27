import { PickFromPath } from '@konecty/sdk/TypeUtils';
import { Module, ModuleConfig, KonectyDocument } from '@konecty/sdk/Module';
import { MetadataField } from 'types/metadata';
import { Filter } from '@konecty/sdk/types';
import { Campaign } from './Campaign';
import { User } from './User';
const queueConfig: ModuleConfig = {
	name: 'Queue',
	collection: 'data.Queue',
	label: {
		en: 'Queue',
		pt_BR: 'Roleta',
	},
	plurals: {
		pt_BR: 'Roletas',
		en: 'Queues',
	},
};
export type QueueCreatedByType = PickFromPath<User, 'name' | 'group.name'>;
export type QueueUpdatedByType = PickFromPath<User, 'name' | 'group.name'>;
export type QueueUserType = PickFromPath<User, 'name' | 'group.name' | 'active'>;
export type QueueTargetCampaignType = PickFromPath<Campaign, 'code' | 'name'>;
export type QueueTypeType = 'Chat' | 'Telefone' | 'Formulario' | 'Email';
export interface Queue extends KonectyDocument<QueueUserType[], QueueCreatedByType, QueueUpdatedByType> {
	active: boolean;
	count: number;
	currentCount: number;
	currentPosition: number;
	name: string;
	chatInvite: string;
	queueUsers: Filter<User>;
	_createdAt: Date;
	_createdBy: QueueCreatedByType;
	_updatedAt: Date;
	_updatedBy: QueueUpdatedByType;
	_user: QueueUserType[];
	type: QueueTypeType;
	targetCampaign: QueueTargetCampaignType;
}
export class QueueModule extends Module<Queue, QueueUserType[], QueueCreatedByType, QueueUpdatedByType> {
	constructor() {
		super(queueConfig);
	}
	readonly active: MetadataField<boolean> = {
		type: 'boolean',
		name: 'active',
		label: { en: 'Active', pt_BR: 'Active' },
		isSortable: true,
		isInherited: true,
	} as MetadataField<boolean>;
	readonly count: MetadataField<number> = {
		isSortable: true,
		minValue: 0,
		type: 'number',
		name: 'count',
		label: { pt_BR: 'Contador', en: 'Count' },
		isInherited: true,
	} as MetadataField<number>;
	readonly currentCount: MetadataField<number> = {
		label: { en: 'Current Count', pt_BR: 'Contador Atual' },
		isSortable: true,
		decimalSize: 0,
		minValue: 0,
		type: 'number',
		name: 'currentCount',
		isInherited: true,
	} as MetadataField<number>;
	readonly currentPosition: MetadataField<number> = {
		type: 'number',
		name: 'currentPosition',
		label: { en: 'Current Position', pt_BR: 'Posição Atual' },
		isRequired: true,
		isSortable: true,
		decimalSize: 0,
		minValue: 1,
		defaultValue: 1,
		isInherited: true,
	} as MetadataField<number>;
	readonly name: MetadataField<string> = {
		type: 'text',
		name: 'name',
		label: { en: 'Name', pt_BR: 'Nome' },
		isSortable: true,
		normalization: 'title',
		isInherited: true,
	} as MetadataField<string>;
	readonly chatInvite: MetadataField<string> = {
		type: 'text',
		name: 'chatInvite',
		label: { en: 'Chat Invite', pt_BR: 'Convite do Chat' },
		isInherited: true,
	} as MetadataField<string>;
	readonly queueUsers: MetadataField<Filter<User>> = {
		type: 'filter',
		name: 'queueUsers',
		label: { en: 'Queue Users', pt_BR: 'Usuários da Roleta' },
		document: 'User',
		filterableFields: ['name', 'group'],
		relations: [{ document: 'QueueUser', reverseLookup: 'queue', lookup: 'user' }],
		isInherited: true,
		filterOnly: true,
	} as MetadataField<Filter<User>>;
	readonly _createdAt: MetadataField<Date> = {
		type: 'dateTime',
		name: '_createdAt',
		label: { en: 'Created At', pt_BR: 'Criado em' },
		isSortable: true,
		isInherited: true,
	} as MetadataField<Date>;
	readonly _createdBy: MetadataField<QueueCreatedByType> = {
		type: 'lookup',
		name: '_createdBy',
		label: { pt_BR: 'Criado por', en: 'Created by' },
		isSortable: true,
		document: 'User',
		descriptionFields: ['name', 'group.name'],
		isInherited: true,
	} as MetadataField<QueueCreatedByType>;
	readonly _updatedAt: MetadataField<Date> = {
		type: 'dateTime',
		name: '_updatedAt',
		label: { en: 'Updated At', pt_BR: 'Atualizado em' },
		isSortable: true,
		isInherited: true,
	} as MetadataField<Date>;
	readonly _updatedBy: MetadataField<QueueUpdatedByType> = {
		document: 'User',
		descriptionFields: ['name', 'group.name'],
		type: 'lookup',
		name: '_updatedBy',
		label: { pt_BR: 'Atualizado por', en: 'Updated by' },
		isInherited: true,
	} as MetadataField<QueueUpdatedByType>;
	readonly _user: MetadataField<QueueUserType> = {
		document: 'User',
		descriptionFields: ['name', 'group.name', 'active'],
		detailFields: ['phone', 'emails'],
		type: 'lookup',
		name: '_user',
		label: { en: 'User', pt_BR: 'Usuário' },
		isSortable: true,
		isList: true,
		isInherited: true,
	} as MetadataField<QueueUserType>;
	readonly type: MetadataField<QueueTypeType> = {
		type: 'picklist',
		label: { pt_BR: 'Tipo', en: 'Type' },
		name: 'type',
		maxSelected: 4,
		minSelected: 0,
		options: {
			Chat: { en: 'Chat', pt_BR: 'Chat' },
			Telefone: { en: 'Phone', pt_BR: 'Telefone' },
			Formulario: { en: 'Form', pt_BR: 'Formulário' },
			Email: { en: 'Email', pt_BR: 'Email' },
		},
		optionsSorter: 'asc',
		renderAs: 'without_scroll',
		isInherited: true,
	} as MetadataField<QueueTypeType>;
	readonly targetCampaign: MetadataField<QueueTargetCampaignType> = {
		type: 'lookup',
		label: { en: 'Target Campaign', pt_BR: 'Campanha da Roleta' },
		name: 'targetCampaign',
		document: 'Campaign',
		isInherited: true,
		descriptionFields: ['code', 'name'],
	} as MetadataField<QueueTargetCampaignType>;
}
