import { KonectyClient, KonectyClientOptions } from 'lib/KonectyClient';
import 'reflect-metadata';
import { MetadataField } from 'types/metadata';
import { FieldOperators } from './FieldOperators';
import { ArrElement, PickFromPath } from './TypeUtils';
import { User } from './User';

export type ModuleCreatedByType = PickFromPath<User, 'name' | 'group.name'>;
export type ModuleUpdatedByType = PickFromPath<User, 'name' | 'group.name'>;
export type ModuleUserType = PickFromPath<User, 'name' | 'group.name' | 'active'>;
export interface ModuleConfig {
	name: string;
	collection: string;
	label: {
		[key: string]: string;
	};
	plurals: {
		[key: string]: string;
	};
}

export interface KonectyDocument<UserType = unknown | never, CreatedByType = unknown | never, UpdatedByType = unknown | never> {
	_id: string;
	_user: UserType extends [never] ? ModuleUserType[] : UserType;
	_createdAt: Date;
	_createdBy: CreatedByType extends [never] ? ModuleCreatedByType : CreatedByType;
	_updatedAt: Date;
	_updatedBy: UpdatedByType extends [never] ? ModuleUpdatedByType : CreatedByType;
}

export type DocumentUser = PickFromPath<User, '_id' | 'name' | 'group.name' | 'active'>;

export type Operator =
	| 'between'
	| 'contains'
	| 'end_with'
	| 'equals'
	| 'exists'
	| 'greater_or_equals'
	| 'greater_than'
	| 'in'
	| 'less_or_equals'
	| 'less_than'
	| 'not_contains'
	| 'not_equals'
	| 'not_in'
	| 'starts_with';

export type Condition = {
	term: string;
	operator: Operator;
	value: unknown;
};

export type FilterConditionValue<
	Property extends string,
	FilterOperator extends Operator,
	PropertyType,
> = FilterOperator extends 'between'
	? {
			term: Property;
			operator: FilterOperator;
			value: {
				greater_or_equals?: PropertyType;
				less_or_equals?: PropertyType;
			};
	  }
	: FilterOperator extends 'exists'
	? { term: Property; operator: FilterOperator; value: boolean }
	: FilterOperator extends 'in' | 'not_id'
	? { term: Property; operator: FilterOperator; value: PropertyType[] }
	: { term: Property; operator: FilterOperator; value: PropertyType };

export type FilterConditions =
	| FilterConditionValue<'_id', FieldOperators<'ObjectId'>, string>
	| FilterConditionValue<'_user', FieldOperators<'lookup'>, string>
	| FilterConditionValue<'_user._id', FieldOperators<'lookup._id'>, string>
	| FilterConditionValue<'_createdAt', FieldOperators<'dateTime'>, Date>
	| FilterConditionValue<'_createdBy', FieldOperators<'lookup'>, string>
	| FilterConditionValue<'_createdBy._id', FieldOperators<'lookup._id'>, string>
	| FilterConditionValue<'_updatedAt', FieldOperators<'dateTime'>, Date>
	| FilterConditionValue<'_updatedBy', FieldOperators<'lookup'>, string>
	| FilterConditionValue<'_updatedBy._id', FieldOperators<'lookup._id'>, string>;

export type ModuleFilter<T> = {
	match: 'and' | 'or';
	conditions: (ModuleFilter<T> | T)[];
};

export class KonectyModule<
	Document extends KonectyDocument<OwnerType, CreatedByType, UpdatedByType>,
	ModuleFilterConditions = FilterConditions,
	OwnerType = never,
	CreatedByType = never,
	UpdatedByType = never,
> {
	#config: ModuleConfig;
	#client: KonectyClient;

	constructor(config: ModuleConfig, clientOptons?: KonectyClientOptions) {
		this.#config = config;
		this.#client = new KonectyClient(clientOptons);
	}

	async findOne(filter: ModuleFilter<ModuleFilterConditions>): Promise<Document | null> {
		console.log(filter);
		return null;
	}

	readonly _id: MetadataField<string> = {
		label: { en: 'Unique Identifier', pt_BR: 'Identificador' },
		isSortable: true,
		type: 'ObjectId',
		name: '_id',
		isInherited: true,
	} as MetadataField<string>;

	readonly _user: MetadataField<ModuleUserType> | MetadataField<ArrElement<Document['_user']>> = {
		descriptionFields: ['name', 'group.name', 'active'],
		detailFields: ['phone', 'emails'],
		type: 'lookup',
		name: '_user',
		label: { en: 'User', pt_BR: 'Usuário' },
		isSortable: true,
		isList: true,
		document: 'User',
		isInherited: true,
	} as MetadataField<ModuleUserType>;

	readonly _createdAt: MetadataField<Date> = {
		label: { en: 'Created At', pt_BR: 'Criado em' },
		isSortable: true,
		type: 'dateTime',
		name: '_createdAt',
		isInherited: true,
	} as MetadataField<Date>;

	readonly _createdBy: MetadataField<ModuleCreatedByType> | MetadataField<Document['_createdBy']> = {
		type: 'lookup',
		name: '_createdBy',
		label: { en: 'Created by', pt_BR: 'Criado por' },
		isSortable: true,
		document: 'User',
		descriptionFields: ['name', 'group.name'],
		isInherited: true,
	} as MetadataField<ModuleCreatedByType>;

	readonly _updatedAt: MetadataField<Date> = {
		type: 'dateTime',
		name: '_updatedAt',
		label: { pt_BR: 'Atualizado em', en: 'Updated At' },
		isSortable: true,
		isInherited: true,
	} as MetadataField<Date>;

	readonly _updatedBy: MetadataField<ModuleUpdatedByType> | MetadataField<Document['_updatedBy']> = {
		label: { en: 'Updated by', pt_BR: 'Atualizado por' },
		document: 'User',
		descriptionFields: ['name', 'group.name'],
		type: 'lookup',
		name: '_updatedBy',
		isInherited: true,
	} as MetadataField<ModuleUpdatedByType>;
}

export type DocumentType = typeof KonectyModule.prototype;
