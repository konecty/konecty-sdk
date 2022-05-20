import { PickFromPath } from '@konecty/sdk/TypeUtils';
import { Document, DocumentConfig, KonectyDocument } from '@konecty/sdk/Document';
import {} from '@konecty/sdk/types';
import { DateTimeField, LookupField, TextField } from '@konecty/sdk/decorators/FieldTypes';
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
export interface ChannelType extends KonectyDocument {
	name: string;
	identifier: string;
	_createdAt: Date;
	_createdBy: ChannelCreatedByType;
	_updatedAt: Date;
	_updatedBy: ChannelUpdatedByType;
}
export class Channel extends Document<ChannelType> implements ChannelType {
	constructor(data?: ChannelType) {
		super(channelConfig, data);
	}
	@TextField
	name!: string;
	@TextField
	identifier!: string;
	@DateTimeField
	_createdAt!: Date;
	@LookupField<User>({ document: new User(), descriptionFields: ['name', 'group.name'] })
	_createdBy!: ChannelCreatedByType;
	@DateTimeField
	_updatedAt!: Date;
	@LookupField<User>({ document: new User(), descriptionFields: ['name', 'group.name'] })
	_updatedBy!: ChannelUpdatedByType;
}
