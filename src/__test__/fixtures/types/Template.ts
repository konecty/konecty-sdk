import { PickFromPath } from '@konecty/sdk/TypeUtils';
import { Document, DocumentConfig, KonectyDocument } from '@konecty/sdk/Document';
import { FieldOptions, FileDescriptor } from '@konecty/sdk/types';
import {
	AutoNumberField,
	DateTimeField,
	FileField,
	JSONField,
	LookupField,
	PicklistField,
	TextField,
} from '@konecty/sdk/decorators/FieldTypes';
import { User } from './User';
const templateConfig: DocumentConfig = {
	name: 'Template',
	collection: 'data.Template',
	label: {
		en: 'Mail Template',
		pt_BR: 'Modelo de email',
	},
	plurals: {
		en: 'Mail Templates',
		pt_BR: 'Modelos de email',
	},
};
export type TemplateCreatedByType = PickFromPath<User, 'name' | 'group.name'>;
export type TemplateUpdatedByType = PickFromPath<User, 'name' | 'group.name'>;
export type TemplateUserType = PickFromPath<User, 'name' | 'group.name' | 'active'>;
export type TemplateTypeType = 'email';
const typeOptions: FieldOptions = { email: { en: 'email', pt_BR: 'email', sort: 1 } } as FieldOptions;
export interface TemplateType extends KonectyDocument {
	code: number;
	name: string;
	type: TemplateTypeType;
	webServices: object;
	style: string;
	document: string;
	view: string;
	value: string;
	subject: string;
	_createdAt: Date;
	_createdBy: TemplateCreatedByType;
	_updatedAt: Date;
	_updatedBy: TemplateUpdatedByType;
	_user: TemplateUserType[];
	attachment: FileDescriptor[];
}
export class Template extends Document<TemplateType> implements TemplateType {
	constructor(data?: TemplateType) {
		super(templateConfig, data);
	}
	@AutoNumberField
	code!: number;
	@TextField
	name!: string;
	@PicklistField({ options: typeOptions })
	type!: TemplateTypeType;
	@JSONField
	webServices!: object;
	@TextField
	style!: string;
	@TextField
	document!: string;
	@TextField
	view!: string;
	@TextField
	value!: string;
	@TextField
	subject!: string;
	@DateTimeField
	_createdAt!: Date;
	@LookupField<User>({ document: new User(), descriptionFields: ['name', 'group.name'] })
	_createdBy!: TemplateCreatedByType;
	@DateTimeField
	_updatedAt!: Date;
	@LookupField<User>({ document: new User(), descriptionFields: ['name', 'group.name'] })
	_updatedBy!: TemplateUpdatedByType;
	@LookupField<User>({ document: new User(), descriptionFields: ['name', 'group.name', 'active'] })
	_user!: TemplateUserType[];
	@FileField
	attachment!: FileDescriptor[];
}
