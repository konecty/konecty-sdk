import { PickFromPath } from '@konecty/sdk/TypeUtils';
import { Document, DocumentConfig, KonectyDocument } from '@konecty/sdk/Document';
import { FieldOptions, Filter } from '@konecty/sdk/types';
import {
	BooleanField,
	DateTimeField,
	FilterField,
	LookupField,
	NumberField,
	PicklistField,
	TextField,
} from '@konecty/sdk/decorators/FieldTypes';
import { Campaign } from './Campaign';
import { User } from './User';
const queueConfig: DocumentConfig = {
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
const typeOptions: FieldOptions = {
	Chat: { en: 'Chat', pt_BR: 'Chat' },
	Telefone: { en: 'Phone', pt_BR: 'Telefone' },
	Formulario: { en: 'Form', pt_BR: 'Formulário' },
	Email: { en: 'Email', pt_BR: 'Email' },
} as FieldOptions;
export interface QueueType extends KonectyDocument {
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
export class Queue extends Document<QueueType> implements QueueType {
	constructor(data?: QueueType) {
		super(queueConfig, data);
	}
	@BooleanField
	active!: boolean;
	@NumberField
	count!: number;
	@NumberField
	currentCount!: number;
	@NumberField
	currentPosition!: number;
	@TextField
	name!: string;
	@TextField
	chatInvite!: string;
	@FilterField
	queueUsers!: Filter<User>;
	@DateTimeField
	_createdAt!: Date;
	@LookupField<User>({ document: new User(), descriptionFields: ['name', 'group.name'] })
	_createdBy!: QueueCreatedByType;
	@DateTimeField
	_updatedAt!: Date;
	@LookupField<User>({ document: new User(), descriptionFields: ['name', 'group.name'] })
	_updatedBy!: QueueUpdatedByType;
	@LookupField<User>({ document: new User(), descriptionFields: ['name', 'group.name', 'active'] })
	_user!: QueueUserType[];
	@PicklistField({ options: typeOptions })
	type!: QueueTypeType;
	@LookupField<Campaign>({ document: new Campaign(), descriptionFields: ['code', 'name'] })
	targetCampaign!: QueueTargetCampaignType;
}
