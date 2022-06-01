import { PickFromPath } from '@konecty/sdk/TypeUtils';
import {
	KonectyModule,
	ModuleConfig,
	KonectyDocument,
	FilterConditionValue,
	FilterConditions,
	ModuleFilter,
} from '@konecty/sdk/Module';
import { MetadataField } from '@konecty/sdk/types/metadata';
import { KonectyClientOptions } from '@konecty/sdk/Client';
import { FieldOperators } from '@konecty/sdk/FieldOperators';
import {} from '@konecty/sdk/types';
import { Campaign } from './Campaign';
import { UserFilterConditions } from './User';
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
export type QueueCreatedByType = { name: string; group: { name: unknown } };
export type QueueUpdatedByType = { name: string; group: { name: unknown } };
export type QueueUserType = { name: string; group: { name: unknown }; active: boolean };
export type QueueTargetCampaignType = PickFromPath<Campaign, 'code' | 'name'>;
export type QueueTypeType = 'Chat' | 'Telefone' | 'Formulario' | 'Email';
export interface Queue extends KonectyDocument<QueueUserType[], QueueCreatedByType, QueueUpdatedByType> {
	active?: boolean;
	count?: number;
	currentCount?: number;
	currentPosition?: number;
	name?: string;
	chatInvite?: string;
	queueUsers?: ModuleFilter<UserFilterConditions>;
	_createdAt?: Date;
	_createdBy?: QueueCreatedByType;
	_updatedAt?: Date;
	_updatedBy?: QueueUpdatedByType;
	_user?: QueueUserType[];
	type?: QueueTypeType;
	targetCampaign?: QueueTargetCampaignType;
}
export type QueueFilterConditions =
	| FilterConditions
	| FilterConditionValue<'active', FieldOperators<'boolean'>, boolean>
	| FilterConditionValue<'count', FieldOperators<'number'>, number>
	| FilterConditionValue<'currentCount', FieldOperators<'number'>, number>
	| FilterConditionValue<'currentPosition', FieldOperators<'number'>, number>
	| FilterConditionValue<'name', FieldOperators<'text'>, string>
	| FilterConditionValue<'chatInvite', FieldOperators<'text'>, string>
	| FilterConditionValue<'queueUsers', FieldOperators<'filter'>, ModuleFilter<UserFilterConditions>>
	| FilterConditionValue<'queueUsers.conditions', FieldOperators<'filter.conditions'>, ModuleFilter<UserFilterConditions>>
	| FilterConditionValue<'_createdAt', FieldOperators<'dateTime'>, Date>
	| FilterConditionValue<'_createdBy', FieldOperators<'lookup'>, QueueCreatedByType>
	| FilterConditionValue<'_createdBy._id', FieldOperators<'lookup._id'>, QueueCreatedByType>
	| FilterConditionValue<'_updatedAt', FieldOperators<'dateTime'>, Date>
	| FilterConditionValue<'_updatedBy', FieldOperators<'lookup'>, QueueUpdatedByType>
	| FilterConditionValue<'_updatedBy._id', FieldOperators<'lookup._id'>, QueueUpdatedByType>
	| FilterConditionValue<'_user', FieldOperators<'lookup'>, QueueUserType>
	| FilterConditionValue<'_user._id', FieldOperators<'lookup._id'>, QueueUserType>
	| FilterConditionValue<'type', FieldOperators<'picklist'>, QueueTypeType>
	| FilterConditionValue<'targetCampaign', FieldOperators<'lookup'>, QueueTargetCampaignType>
	| FilterConditionValue<'targetCampaign._id', FieldOperators<'lookup._id'>, QueueTargetCampaignType>;
export type QueueSortFields =
	| 'active'
	| 'count'
	| 'currentCount'
	| 'currentPosition'
	| 'name'
	| '_createdAt'
	| '_createdBy'
	| '_updatedAt'
	| '_user';
export class QueueModule extends KonectyModule<
	Queue,
	QueueFilterConditions,
	QueueSortFields,
	QueueUserType[],
	QueueCreatedByType,
	QueueUpdatedByType
> {
	constructor(clientOptions?: KonectyClientOptions) {
		super(queueConfig, clientOptions);
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
	readonly queueUsers: MetadataField<ModuleFilter<UserFilterConditions>> = {
		type: 'filter',
		name: 'queueUsers',
		label: { en: 'Queue Users', pt_BR: 'Usuários da Roleta' },
		document: 'User',
		filterableFields: ['name', 'group'],
		relations: [{ document: 'QueueUser', reverseLookup: 'queue', lookup: 'user' }],
		isInherited: true,
		filterOnly: true,
	} as MetadataField<ModuleFilter<UserFilterConditions>>;
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
