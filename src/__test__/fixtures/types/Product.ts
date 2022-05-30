import { PickFromPath } from '@konecty/sdk/TypeUtils';
import { Module, ModuleConfig, KonectyDocument } from '@konecty/sdk/Module';
import { MetadataField } from 'types/metadata';
import { KonectyClientOptions } from 'lib/KonectyClient';
import { FileDescriptor, Money } from '@konecty/sdk/types';
import { Campaign } from './Campaign';
import { User } from './User';
const productConfig: ModuleConfig = {
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
export type ProductCreatedByType = { name: string; group: { name: unknown } };
export type ProductUpdatedByType = { name: string; group: { name: unknown } };
export type ProductUserType = { name: string; group: { name: unknown } };
export type ProductStatusType = 'Rascunho' | 'Ativo' | 'Inativo' | 'Não Realizado';
export type ProductTypeType = 'Apartamento' | 'Casa' | 'Terreno';
export interface Product extends KonectyDocument<ProductUserType[], ProductCreatedByType, ProductUpdatedByType> {
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
export class ProductModule extends Module<Product, ProductUserType[], ProductCreatedByType, ProductUpdatedByType> {
	constructor(clientOptions?: KonectyClientOptions) {
		super(productConfig, clientOptions);
	}
	readonly active: MetadataField<boolean> = {
		type: 'boolean',
		name: 'active',
		label: { en: 'Active', pt_BR: 'Ativo' },
		isSortable: true,
		isInherited: true,
	} as MetadataField<boolean>;
	readonly supplierUpdatedChanged: MetadataField<boolean> = {
		type: 'boolean',
		name: 'supplierUpdatedChanged',
		label: { en: 'Supplier updated mannually', pt_BR: 'Supplier updated mannually' },
		isSortable: true,
		isInherited: true,
	} as MetadataField<boolean>;
	readonly code: MetadataField<number> = {
		name: 'code',
		label: { en: 'Code', pt_BR: 'Código' },
		isUnique: true,
		isSortable: true,
		type: 'autoNumber',
		isInherited: true,
	} as MetadataField<number>;
	readonly sale: MetadataField<Money> = {
		isSortable: true,
		minValue: 0,
		type: 'money',
		name: 'sale',
		label: { en: 'Sale', pt_BR: 'Valor de Venda' },
		isInherited: true,
	} as MetadataField<Money>;
	readonly campaign: MetadataField<ProductCampaignType> = {
		name: 'campaign',
		type: 'lookup',
		label: { en: 'Campaign', pt_BR: 'Campanha' },
		isSortable: true,
		detailFields: ['code', 'name'],
		document: 'Campaign',
		descriptionFields: ['code', 'name'],
	} as MetadataField<ProductCampaignType>;
	readonly joinedCampaignOn: MetadataField<Date> = {
		isSortable: true,
		type: 'date',
		name: 'joinedCampaignOn',
		label: { en: 'joined the Campaign On', pt_BR: 'Entrou na Campanha em' },
		isInherited: true,
	} as MetadataField<Date>;
	readonly shippingAmount: MetadataField<Money> = {
		isSortable: true,
		decimalSize: 2,
		minValue: 0,
		type: 'money',
		name: 'shippingAmount',
		label: { en: 'Shipping Amount', pt_BR: 'Valor do Transporte' },
		isInherited: true,
	} as MetadataField<Money>;
	readonly description: MetadataField<string> = {
		type: 'text',
		name: 'description',
		label: { en: 'Description', pt_BR: 'Descrição' },
		isInherited: true,
	} as MetadataField<string>;
	readonly file: MetadataField<FileDescriptor> = {
		type: 'file',
		name: 'file',
		label: { en: 'Files', pt_BR: 'Arquivos' },
		isList: true,
		maxSize: 10240,
		isInherited: true,
	} as MetadataField<FileDescriptor>;
	readonly name: MetadataField<string> = {
		isSortable: true,
		normalization: 'title',
		type: 'text',
		name: 'name',
		label: { pt_BR: 'Nome', en: 'Name' },
		isInherited: true,
	} as MetadataField<string>;
	readonly pictures: MetadataField<FileDescriptor> = {
		label: { en: 'Pictures', pt_BR: 'Imagens' },
		isList: true,
		wildcard: '(jpg|jpeg)',
		maxSize: 10240,
		type: 'file',
		name: 'pictures',
		isInherited: true,
	} as MetadataField<FileDescriptor>;
	readonly sku: MetadataField<string> = {
		name: 'sku',
		label: { en: 'SKU', pt_BR: 'SKU' },
		isSortable: true,
		type: 'text',
		isInherited: true,
	} as MetadataField<string>;
	readonly status: MetadataField<ProductStatusType> = {
		defaultValues: [{ en: 'Draft', pt_BR: 'Rascunho' }],
		maxSelected: 1,
		minSelected: 1,
		name: 'status',
		type: 'picklist',
		isSortable: true,
		label: { en: 'Status', pt_BR: 'Situação' },
		options: {
			Rascunho: { en: 'Draft', pt_BR: 'Rascunho' },
			Ativo: { pt_BR: 'Ativo', en: 'Active' },
			Inativo: { en: 'Inactive', pt_BR: 'Inativo' },
			'Não Realizado': { en: 'Not Done', pt_BR: 'Não Realizado' },
		},
		renderAs: 'without_scroll',
		isInherited: true,
	} as MetadataField<ProductStatusType>;
	readonly type: MetadataField<ProductTypeType> = {
		label: { en: 'Type', pt_BR: 'Tipo' },
		isRequired: true,
		isSortable: true,
		renderAs: 'without_scroll',
		minSelected: 1,
		maxSelected: 1,
		optionsSorter: 'asc',
		type: 'picklist',
		name: 'type',
		isInherited: true,
		options: {
			Apartamento: { pt_BR: 'Apartamento', sort: 1 },
			Casa: { pt_BR: 'Casa', sort: 2 },
			Terreno: { pt_BR: 'Terreno', sort: 3 },
		},
	} as MetadataField<ProductTypeType>;
	readonly _createdAt: MetadataField<Date> = {
		name: '_createdAt',
		label: { en: 'Created At', pt_BR: 'Criado em' },
		isSortable: true,
		type: 'dateTime',
		isInherited: true,
	} as MetadataField<Date>;
	readonly _createdBy: MetadataField<ProductCreatedByType> = {
		document: 'User',
		descriptionFields: ['name', 'group.name'],
		type: 'lookup',
		name: '_createdBy',
		label: { en: 'Created by', pt_BR: 'Criado por' },
		isSortable: true,
		isInherited: true,
	} as MetadataField<ProductCreatedByType>;
	readonly _updatedAt: MetadataField<Date> = {
		type: 'dateTime',
		name: '_updatedAt',
		label: { en: 'Updated At', pt_BR: 'Atualizado em' },
		isSortable: true,
		isInherited: true,
	} as MetadataField<Date>;
	readonly _updatedBy: MetadataField<ProductUpdatedByType> = {
		type: 'lookup',
		name: '_updatedBy',
		label: { en: 'Updated by', pt_BR: 'Atualizado por' },
		document: 'User',
		descriptionFields: ['name', 'group.name'],
		isInherited: true,
	} as MetadataField<ProductUpdatedByType>;
	readonly _user: MetadataField<ProductUserType> = {
		type: 'lookup',
		name: '_user',
		label: { en: 'User', pt_BR: 'Usuário' },
		isSortable: true,
		isList: true,
		document: 'User',
		descriptionFields: ['name', 'group.name'],
		detailFields: ['phone', 'emails'],
		isInherited: true,
	} as MetadataField<ProductUserType>;
	readonly sendSupplierUpdatedMail: MetadataField<boolean> = {
		label: { en: 'E-mail for Supplier Updated At', pt_BR: 'E-mail Atualização Proprietário' },
		type: 'boolean',
		name: 'sendSupplierUpdatedMail',
		defaultValue: true,
	} as MetadataField<boolean>;
	readonly offerCount: MetadataField<number> = {
		type: 'number',
		name: 'offerCount',
		label: { en: 'Offer Count', pt_BR: 'Quantidade de Propostas' },
		isSortable: true,
	} as MetadataField<number>;
	readonly availableAt: MetadataField<Date> = {
		type: 'date',
		name: 'availableAt',
		label: { pt_BR: 'Disponível em', en: 'Available at' },
	} as MetadataField<Date>;
	readonly banner: MetadataField<FileDescriptor> = {
		wildcard: '(jpg|jpeg|png)',
		maxSize: 10240,
		type: 'file',
		name: 'banner',
		label: { en: 'Banners', pt_BR: 'Banners' },
		isList: true,
		minItems: 0,
		maxItems: 3,
	} as MetadataField<FileDescriptor>;
	readonly link: MetadataField<string> = {
		type: 'url',
		name: 'link',
		label: { en: 'Site', pt_BR: 'Site' },
		isList: true,
		minItems: 0,
	} as MetadataField<string>;
	readonly notes: MetadataField<string> = {
		label: { en: 'Notes', pt_BR: 'Observações Internas' },
		type: 'richText',
		name: 'notes',
	} as MetadataField<string>;
	readonly parentProduct: MetadataField<string> = {
		normalization: 'title',
		type: 'text',
		name: 'parentProduct',
		label: { en: 'Development Name', pt_BR: 'Empreendimento VISTA' },
		isSortable: true,
	} as MetadataField<string>;
	readonly siteTags: MetadataField<string> = {
		type: 'text',
		name: 'siteTags',
		label: { en: 'Site Tags', pt_BR: 'Tags Site' },
		isInherited: true,
		isList: true,
	} as MetadataField<string>;
	readonly campaignTags: MetadataField<string> = {
		type: 'text',
		name: 'campaignTags',
		label: { en: 'Campaign Tags', pt_BR: 'Tags Campanha' },
		isInherited: true,
		isList: true,
	} as MetadataField<string>;
}
