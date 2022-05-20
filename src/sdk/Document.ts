import 'reflect-metadata';
import { DateTimeField, LookupField, ObjectIdField } from './decorators/FieldTypes';
import { FieldType } from './types';
import { PickFromPath } from './TypeUtils';
import { User } from './User';

// export type DocumentUser = Pick<User, '_id' | 'name' | 'group' | 'active'>;

export interface DocumentConfig {
	name: string;
	collection: string;
	label: {
		[key: string]: string;
	};
	plurals: {
		[key: string]: string;
	};
}

// descriptor.isList = false;
// 	descriptor.type = FieldType.ObjectId;
// 	descriptor.configurable = false;
// 	descriptor.writable = false;
// 	descriptor.enumerable = false;
// 	descriptor.set = function (value: string) {
// 		throw new Error('Cannot set value on id field');
// 	};
// 	descriptor.get = function (): string {
// 		return descriptor.value;
// 	};
// 	descriptor.toString = function () {
// 		return descriptor.value;
// 	};

export interface F2 {
	type: FieldType;
}

type List = { isList: true };

// interface ObjectId {
// 	// type: 'text';
// 	readonly value: string;
// 	get(): string;
// }

// type ObjectId = { type: FieldType.ObjectId};
// type ObjectId = { type: FieldType.ObjectId };

// type PrimitiveType<T extends { type: FieldType }> = T['type'] extends FieldType.ObjectId ? string : never;

// type z = PrimitiveType<ObjectId>;

// const y: z = 'teste';

// console.log(y);

type Text = string & { type: FieldType.text };

type Label<T extends { [lang: string]: string }> = { label: T };

function dec(target: any, key: string) {
	Object.defineProperty(target, key, {
		enumerable: true,
	});
}

export interface KonectyDocument {
	_id: string;
	_createdAt: Date;
	_updatedAt: Date;
}

export type DocumentUser = PickFromPath<User, '_id' | 'name' | 'group.name' | 'active'>;

export abstract class Document<T> implements KonectyDocument {
	#config: DocumentConfig;
	private _data?: T;

	constructor(config: DocumentConfig, data?: T) {
		this.#config = config;
		this._data = data;
	}

	get config(): DocumentConfig {
		return this.#config;
	}

	get data(): T | undefined | null {
		return this._data;
	}

	@ObjectIdField
	_id!: string;

	getType(propertyKey: string): FieldType {
		return Reflect.getMetadata('type', this, propertyKey);
	}

	@LookupField<User>({ document: new User(), descriptionFields: ['name', 'group.name', 'active'] })
	_user!: DocumentUser[];

	@DateTimeField
	_createdAt!: Date;

	@LookupField<User>({ document: new User(), descriptionFields: ['name', 'group.name', 'active'] })
	createdBy!: DocumentUser;

	@DateTimeField
	_updatedAt!: Date;

	@LookupField<User>({ document: new User(), descriptionFields: ['name', 'group.name', 'active'] })
	_updatedBy!: DocumentUser;
}

export type DocumentType = typeof Document.prototype;

// const x = new Document(
// 	{
// 		name: 'User',
// 		collection: 'users',
// 		label: {
// 			en: 'User',
// 			pt_BR: 'Usuário',
// 		},
// 		plurals: {
// 			en: 'Users',
// 			pt_BR: 'Usuários',
// 		},
// 	},
// 	{ _id: '123' },
// );

// x._id = '123';
// console.log(x._id);
// console.log(x._id.type);

// const x: Document = {
// 	_id: 'my-id',
// 	// test: ['text 1', 'text 2'],
// 	// test2: 'text 3',
// };

// console.log(x._id); // 'my-id'
// console.log(x._id.type); // FieldType.ObjectId

// const x1 = KonectyDocument.create('Document', {
// 	_id: 'my-id',
// 	test: ['text 1', 'text 2'],
// 	test2: 'text 3',
// });
