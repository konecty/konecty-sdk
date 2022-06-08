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
const accessFailedLogConfig: ModuleConfig = {
	name: 'AccessFailedLog',
	collection: 'data.AccessFailedLog',
	label: {
		en: 'Access Failed Log',
		pt_BR: 'Log de Erro de Acesso',
	},
	plurals: {
		en: 'Access Failed Logs',
		pt_BR: 'Logs de Erros de Acesso',
	},
};
export type AccessFailedLogCreatedByType = { _id: string; group: { name: unknown } };
export type AccessFailedLogUpdatedByType = { _id: string; group: { name: unknown } };
export type AccessFailedLogUserType = { _id: string; group: { name: unknown } };
export interface AccessFailedLog
	extends KonectyDocument<AccessFailedLogUserType[], AccessFailedLogCreatedByType, AccessFailedLogUpdatedByType> {
	browser?: string;
	browserEngine?: string;
	browserEngineVersion?: string;
	browserVersion?: string;
	geolocation?: string;
	height?: number;
	ip?: string;
	isMobile?: boolean;
	login?: string;
	os?: string;
	platform?: string;
	reason?: string;
	width?: number;
	_createdAt?: Date;
	_createdBy?: AccessFailedLogCreatedByType;
	_updatedAt?: Date;
	_updatedBy?: AccessFailedLogUpdatedByType;
	status?: AccessFailedLogStatusType;
	_user?: AccessFailedLogUserType[];
}
export type AccessFailedLogFilterConditions =
	| FilterConditions
	| FilterConditionValue<'browser', FieldOperators<'text'>, string>
	| FilterConditionValue<'browserEngine', FieldOperators<'text'>, string>
	| FilterConditionValue<'browserEngineVersion', FieldOperators<'text'>, string>
	| FilterConditionValue<'browserVersion', FieldOperators<'text'>, string>
	| FilterConditionValue<'geolocation', FieldOperators<'geoloc'>, string>
	| FilterConditionValue<'height', FieldOperators<'number'>, number>
	| FilterConditionValue<'ip', FieldOperators<'text'>, string>
	| FilterConditionValue<'isMobile', FieldOperators<'boolean'>, boolean>
	| FilterConditionValue<'login', FieldOperators<'text'>, string>
	| FilterConditionValue<'os', FieldOperators<'text'>, string>
	| FilterConditionValue<'platform', FieldOperators<'text'>, string>
	| FilterConditionValue<'reason', FieldOperators<'text'>, string>
	| FilterConditionValue<'width', FieldOperators<'number'>, number>
	| FilterConditionValue<'_createdAt', FieldOperators<'dateTime'>, Date>
	| FilterConditionValue<'_createdBy', FieldOperators<'lookup'>, AccessFailedLogCreatedByType>
	| FilterConditionValue<'_createdBy._id', FieldOperators<'lookup._id'>, AccessFailedLogCreatedByType>
	| FilterConditionValue<'_updatedAt', FieldOperators<'dateTime'>, Date>
	| FilterConditionValue<'_updatedBy', FieldOperators<'lookup'>, AccessFailedLogUpdatedByType>
	| FilterConditionValue<'_updatedBy._id', FieldOperators<'lookup._id'>, AccessFailedLogUpdatedByType>
	| FilterConditionValue<'status', FieldOperators<'picklist'>, AccessFailedLogStatusType>
	| FilterConditionValue<'_user', FieldOperators<'lookup'>, AccessFailedLogUserType>
	| FilterConditionValue<'_user._id', FieldOperators<'lookup._id'>, AccessFailedLogUserType>;
export type AccessFailedLogSortFields = '_createdAt' | '_createdBy' | '_updatedAt' | '_user';
export class AccessFailedLogModule extends KonectyModule<
	AccessFailedLog,
	AccessFailedLogFilterConditions,
	AccessFailedLogSortFields,
	AccessFailedLogUserType[],
	AccessFailedLogCreatedByType,
	AccessFailedLogUpdatedByType
> {
	constructor(clientOptions?: KonectyClientOptions) {
		super(accessFailedLogConfig, clientOptions);
	}
	readonly 'browser': MetadataField<string> = {
		type: 'text',
		name: 'browser',
		label: { en: 'Browser', pt_BR: 'Browser' },
		isInherited: true,
	} as MetadataField<string>;
	readonly 'browserEngine': MetadataField<string> = {
		type: 'text',
		name: 'browserEngine',
		label: { en: 'Browser engine', pt_BR: 'Motor do browser' },
		isInherited: true,
	} as MetadataField<string>;
	readonly 'browserEngineVersion': MetadataField<string> = {
		name: 'browserEngineVersion',
		label: { en: 'Browser engine version', pt_BR: 'Versão da engine do browser' },
		type: 'text',
		isInherited: true,
	} as MetadataField<string>;
	readonly 'browserVersion': MetadataField<string> = {
		type: 'text',
		name: 'browserVersion',
		label: { pt_BR: 'Versão do browser', en: 'Browser version' },
		isInherited: true,
	} as MetadataField<string>;
	readonly 'geolocation': MetadataField<string> = {
		label: { en: 'Geolocation', pt_BR: 'Geolocalização' },
		bits: 26,
		type: 'geoloc',
		name: 'geolocation',
		isInherited: true,
	} as MetadataField<string>;
	readonly 'height': MetadataField<number> = {
		name: 'height',
		label: { en: 'Screen height', pt_BR: 'Altura da tela' },
		type: 'number',
		isInherited: true,
	} as MetadataField<number>;
	readonly 'ip': MetadataField<string> = {
		type: 'text',
		name: 'ip',
		label: { en: 'IP Address', pt_BR: 'Endereço IP' },
		isInherited: true,
	} as MetadataField<string>;
	readonly 'isMobile': MetadataField<boolean> = {
		type: 'boolean',
		name: 'isMobile',
		label: { en: 'Mobile device', pt_BR: 'Dispositivo móvel' },
		isInherited: true,
	} as MetadataField<boolean>;
	readonly 'login': MetadataField<string> = {
		type: 'text',
		name: 'login',
		label: { en: 'Login', pt_BR: 'Login' },
		isInherited: true,
	} as MetadataField<string>;
	readonly 'os': MetadataField<string> = {
		type: 'text',
		name: 'os',
		label: { pt_BR: 'Sistema Operacional', en: 'Operational System' },
		isInherited: true,
	} as MetadataField<string>;
	readonly 'platform': MetadataField<string> = {
		label: { en: 'Platform', pt_BR: 'Plataforma' },
		type: 'text',
		name: 'platform',
		isInherited: true,
	} as MetadataField<string>;
	readonly 'reason': MetadataField<string> = {
		type: 'text',
		name: 'reason',
		label: { en: 'Reason', pt_BR: 'Motivo' },
		isInherited: true,
	} as MetadataField<string>;
	readonly 'width': MetadataField<number> = {
		type: 'number',
		name: 'width',
		label: { en: 'Screen width', pt_BR: 'Largura da tela' },
		isInherited: true,
	} as MetadataField<number>;
	readonly '_createdAt': MetadataField<Date> = {
		name: '_createdAt',
		label: { en: 'Created At', pt_BR: 'Criado em' },
		isSortable: true,
		type: 'dateTime',
		isInherited: true,
	} as MetadataField<Date>;
	readonly '_createdBy': MetadataField<AccessFailedLogCreatedByType> = {
		label: { en: 'Created by', pt_BR: 'Criado por' },
		isSortable: true,
		document: 'User',
		descriptionFields: ['name', 'group.name'],
		type: 'lookup',
		name: '_createdBy',
		isInherited: true,
	} as MetadataField<AccessFailedLogCreatedByType>;
	readonly '_updatedAt': MetadataField<Date> = {
		type: 'dateTime',
		name: '_updatedAt',
		label: { pt_BR: 'Atualizado em', en: 'Updated At' },
		isSortable: true,
		isInherited: true,
	} as MetadataField<Date>;
	readonly '_updatedBy': MetadataField<AccessFailedLogUpdatedByType> = {
		label: { en: 'Updated by', pt_BR: 'Atualizado por' },
		document: 'User',
		descriptionFields: ['name', 'group.name'],
		type: 'lookup',
		name: '_updatedBy',
		isInherited: true,
	} as MetadataField<AccessFailedLogUpdatedByType>;
	readonly 'status': MetadataField<AccessFailedLogStatusType> = {
		optionsSorter: 'asc',
		type: 'picklist',
		name: 'status',
		label: { en: 'Status', pt_BR: 'Situação' },
		renderAs: 'without_scroll',
		minSelected: 0,
		maxSelected: 1,
		isInherited: true,
	} as MetadataField<AccessFailedLogStatusType>;
	readonly '_user': MetadataField<AccessFailedLogUserType> = {
		name: '_user',
		label: { en: 'User', pt_BR: 'Usuário' },
		isSortable: true,
		isList: true,
		document: 'User',
		descriptionFields: ['name', 'group.name'],
		detailFields: ['phone', 'emails'],
		type: 'lookup',
		isInherited: true,
	} as MetadataField<AccessFailedLogUserType>;
}
