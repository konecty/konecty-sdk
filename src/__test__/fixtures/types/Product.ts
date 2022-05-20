import { PickFromPath } from '@konecty/sdk/TypeUtils';
import { Document, DocumentConfig, KonectyDocument } from '@konecty/sdk/Document';
import { FieldOptions, FileDescriptor, Money } from '@konecty/sdk/types';
import {
	AutoNumberField,
	BooleanField,
	DateField,
	DateTimeField,
	FileField,
	LookupField,
	MoneyField,
	NumberField,
	PicklistField,
	RichTextField,
	TextField,
	UrlField,
} from '@konecty/sdk/decorators/FieldTypes';
import { Campaign } from './Campaign';
import { User } from './User';
const productConfig: DocumentConfig = {
	name: 'Product',
	collection: 'data.Product',
	label: {
		en: 'Product or Service',
		pt_BR: 'Imóvel',
	},
	plurals: {
		en: 'Products & Services',
		pt_BR: 'Imóveis',
	},
};
export type ProductCampaignType = PickFromPath<Campaign, 'code' | 'name'>;
export type ProductCreatedByType = PickFromPath<User, 'name' | 'group.name'>;
export type ProductUpdatedByType = PickFromPath<User, 'name' | 'group.name'>;
export type ProductUserType = PickFromPath<User, 'name' | 'group.name'>;
export type ProductStatusType = 'Rascunho' | 'Ativo' | 'Inativo' | 'Não Realizado';
export type ProductTypeType = 'Apartamento' | 'Casa' | 'Terreno';
const statusOptions: FieldOptions = {
	Rascunho: { en: 'Draft', pt_BR: 'Rascunho' },
	Ativo: { pt_BR: 'Ativo', en: 'Active' },
	Inativo: { en: 'Inactive', pt_BR: 'Inativo' },
	'Não Realizado': { en: 'Not Done', pt_BR: 'Não Realizado' },
} as FieldOptions;
const typeOptions: FieldOptions = {
	Apartamento: { pt_BR: 'Apartamento', sort: 1 },
	Casa: { pt_BR: 'Casa', sort: 2 },
	Terreno: { pt_BR: 'Terreno', sort: 3 },
} as FieldOptions;
export interface ProductType extends KonectyDocument {
	active: boolean;
	supplierUpdatedChanged: boolean;
	code: number;
	sale: Money;
	campaign: ProductCampaignType;
	joinedCampaignOn: Date;
	shippingAmount: Money;
	description: string;
	file: FileDescriptor[];
	name: string;
	pictures: FileDescriptor[];
	sku: string;
	status: ProductStatusType;
	type: ProductTypeType;
	_createdAt: Date;
	_createdBy: ProductCreatedByType;
	_updatedAt: Date;
	_updatedBy: ProductUpdatedByType;
	_user: ProductUserType[];
	sendSupplierUpdatedMail: boolean;
	offerCount: number;
	availableAt: Date;
	banner: FileDescriptor[];
	link: string[];
	notes: string;
	parentProduct: string;
	siteTags: string[];
	campaignTags: string[];
}
export class Product extends Document<ProductType> implements ProductType {
	constructor(data?: ProductType) {
		super(productConfig, data);
	}
	@BooleanField
	active!: boolean;
	@BooleanField
	supplierUpdatedChanged!: boolean;
	@AutoNumberField
	code!: number;
	@MoneyField
	sale!: Money;
	@LookupField<Campaign>({ document: new Campaign(), descriptionFields: ['code', 'name'] })
	campaign!: ProductCampaignType;
	@DateField
	joinedCampaignOn!: Date;
	@MoneyField
	shippingAmount!: Money;
	@TextField
	description!: string;
	@FileField
	file!: FileDescriptor[];
	@TextField
	name!: string;
	@FileField
	pictures!: FileDescriptor[];
	@TextField
	sku!: string;
	@PicklistField({ options: statusOptions })
	status!: ProductStatusType;
	@PicklistField({ options: typeOptions })
	type!: ProductTypeType;
	@DateTimeField
	_createdAt!: Date;
	@LookupField<User>({ document: new User(), descriptionFields: ['name', 'group.name'] })
	_createdBy!: ProductCreatedByType;
	@DateTimeField
	_updatedAt!: Date;
	@LookupField<User>({ document: new User(), descriptionFields: ['name', 'group.name'] })
	_updatedBy!: ProductUpdatedByType;
	@LookupField<User>({ document: new User(), descriptionFields: ['name', 'group.name'] })
	_user!: ProductUserType[];
	@BooleanField
	sendSupplierUpdatedMail!: boolean;
	@NumberField
	offerCount!: number;
	@DateField
	availableAt!: Date;
	@FileField
	banner!: FileDescriptor[];
	@UrlField
	link!: string[];
	@RichTextField
	notes!: string;
	@TextField
	parentProduct!: string;
	@TextField
	siteTags!: string[];
	@TextField
	campaignTags!: string[];
}
