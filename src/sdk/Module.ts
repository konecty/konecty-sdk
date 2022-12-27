import { KonectyClient, KonectyClientOptions, KonectyFindResult } from '@konecty/sdk/Client';
import { MetadataField, MetadataLabel } from '@konecty/sdk/types/metadata';
import get from 'lodash/get';
import 'reflect-metadata';
import { FieldOperators } from './FieldOperators';
import { ArrElement, Nullable, PickFromPath, UnionToIntersection } from './TypeUtils';
import { User } from './User';

export type ModuleCreatedByType = UnionToIntersection<PickFromPath<User, 'name' | 'group.name'>>;
export type ModuleUpdatedByType = UnionToIntersection<PickFromPath<User, 'name' | 'group.name'>>;
export type ModuleUserType = UnionToIntersection<PickFromPath<User, 'name' | 'group.name' | 'active'>>;
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
	_id?: string;
	_user?: UserType extends [never] ? ModuleUserType[] : UserType;
	_createdAt?: Date;
	_createdBy?: CreatedByType extends [never] ? ModuleCreatedByType : CreatedByType;
	_updatedAt?: Date;
	_updatedBy?: UpdatedByType extends [never] ? ModuleUpdatedByType : CreatedByType;
}

export type DocumentUser = UnionToIntersection<PickFromPath<User, '_id' | 'name' | 'group.name' | 'active'>>;

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
	: FilterOperator extends 'in' | 'not_in'
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

export type SortableFields = '_createdAt' | '_updatedAt';

export type ModuleSort<T> = {
	property: T;
	direction: 'ASC' | 'DESC';
};

export type ModuleFindAllOptions<T> = {
	start?: number;
	limit?: number;
	sort?: ModuleSort<T>[];
};

export type FindResult<T> = {
	data: T[];
	count: number;
};

export type ValidateResult = {
	success: boolean;
	errors?: {
		required?: { [key: string]: MetadataLabel };
	};
};

export type ModuleActionResult<T> = {
	success: boolean;
	data?: T[];
	errors?: { message: string }[];
};

export class KonectyModule<
	Document extends KonectyDocument<OwnerType, CreatedByType, UpdatedByType>,
	ModuleFilterConditions = FilterConditions,
	ModuleSortFields = SortableFields,
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

	// #region Retrieve
	async findOne(filter: ModuleFilter<ModuleFilterConditions>): Promise<Document | null> {
		const result = await this.#client.find(this.#config.name, {
			filter,
			limit: 1,
		});

		if (result?.success === true && result.data?.length === 1) {
			return result.data[0] as Document;
		}
		if (result.data?.length === 0) {
			return null;
		}

		throw new Error(result.errors?.join('\n') ?? 'Unknown error');
	}

	async find(
		filter: ModuleFilter<ModuleFilterConditions>,
		options?: ModuleFindAllOptions<ModuleSortFields>,
	): Promise<FindResult<Document>> {
		const result = await this.#client.find(
			this.#config.name,
			Object.assign(
				{},
				{
					filter,
					start: 0,
					limit: 50,
				},
				options ?? {},
			),
		);

		if (result?.success === true) {
			return {
				data: result.data as Document[],
				count: result.total as number,
			};
		}
		throw new Error(result.errors?.join('\n') ?? 'Unknown error');
	}

	// #endregion

	validate(document: Document): ValidateResult {
		const required: {
			[key: string]: MetadataLabel;
		} = Object.values(this)
			.filter((field: MetadataField) => field?.isRequired === true && get(document, field.name) == null)
			.reduce((acc, field: MetadataField) => Object.assign(acc, { [field.name]: field.label ?? { en: field.name } }), {});

		if (Object.keys(required).length > 0) {
			return {
				success: false,
				errors: {
					required,
				},
			};
		}

		return { success: true };
	}

	// #region Create/Update/Delete
	async create(document: Document): Promise<ModuleActionResult<Document>> {
		const result = await this.#client.create(this.#config.name, document);

		return result as ModuleActionResult<Document>;
	}

	async update(
		document: Nullable<Document>,
		ids: Array<PickFromPath<Document, '_id' | '_updatedAt'>>,
	): Promise<ModuleActionResult<Document>> {
		const result = await this.#client.update(this.#config.name, document, ids);

		return result as ModuleActionResult<Document>;
	}

	async delete(ids: Array<PickFromPath<Document, '_id' | '_updatedAt'>>): Promise<ModuleActionResult<Document>> {
		const result = await this.#client.delete(this.#config.name, ids);

		return result as ModuleActionResult<Document>;
	}

	// #endregion

	// #region lookups

	lookup<T>(field: string, search: string): Promise<KonectyFindResult<T>> {
		return this.#client.lookup<T>(this.#config.name, field, search);
	}
	// #endregion

	// #region commom properties
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
		lookup: (search: string) => this.lookup<ModuleUserType>('_user', search),
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
		lookup: (search: string) => this.lookup<ModuleUserType>('_createdBy', search),
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
		lookup: (search: string) => this.lookup<ModuleUserType>('_updatedBy', search),
	} as MetadataField<ModuleUpdatedByType>;
	// #endregion
}

export type DocumentType = typeof KonectyModule.prototype;
