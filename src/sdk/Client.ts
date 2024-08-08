import { isBrowser, isNode } from 'browser-or-node';
import crypto from 'crypto';
import fetch from 'isomorphic-fetch';
import Cookies from 'js-cookie';
import get from 'lodash/get';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import { DateTime } from 'luxon';
import qs from 'qs';
import { UserGroupType } from './User';

import { PickFromPath, UnionToIntersection } from '@konecty/sdk/TypeUtils';
import logger from '../lib/logger';
import { KonectyDocument } from './Module';
import { User } from './User';
import { DocumentTranslation, List, Menu, ZipCodeEntry } from './types';
import { MetaAccess, UpdateAccessPayload } from './types/access';

export interface KonectyClientOptions {
	credentialsFile?: string;
	endpoint?: string;
	accessKey?: string;
}

export type KonectyFindParams = {
	filter: object;
	start?: number;
	limit?: number;
	sort?: Array<object>;
	fields?: Array<string | number | symbol>;
};

export type History = {
	_id: number;
	type: 'create' | 'update';
	createdAt: Date;
	createdBy: {
		group: UserGroupType;
		name: string;
		_id: string;
	};
	dataId: string;
	diffs: {
		[key: string]: {
			to: any;
		};
	};
};

export type KonectyFindResult<T = object> = {
	success: boolean;
	total?: number;
	data?: Array<T>;
	errors?: { message: string }[];
};

export type KonectyGetMetaResult<T> = {
	success: boolean;
	data?: T;
	errors?: string[] | { message: string }[];
};

export type KonectyLoginResult = {
	success: boolean;
	authId?: string;
	user?: UnionToIntersection<
		PickFromPath<User, 'access' | 'admin' | 'email' | 'group' | 'locale' | 'login' | 'name' | 'role' | '_id'>
	>;
	errors?: string[];
};

export type KonectyUserInfo = {
	logged: boolean;
	user?: User;
};

export type KonectyNextOnQueueResult = {
	success: boolean;
	user?: {
		_id: string;
		user: UnionToIntersection<PickFromPath<User, '_id' | 'director' | 'group' | 'emails' | 'name' | 'code'>>;
		queue: {
			_id: string;
			name: string;
		};
		count: number;
		order: number;
		_user: Array<UnionToIntersection<PickFromPath<User, '_id' | 'group' | 'name'>>>;
		_createdAt: Date;
		_updatedAt: Date;
		_createdBy: Array<UnionToIntersection<PickFromPath<User, '_id' | 'group' | 'name'>>>;
		_updatedBy: Array<UnionToIntersection<PickFromPath<User, '_id' | 'group' | 'name'>>>;
	};
};
export class KonectyClient {
	static defaults: KonectyClientOptions = {};
	#options: KonectyClientOptions;

	constructor(options?: KonectyClientOptions) {
		this.#options = Object.assign({}, KonectyClient.defaults, options);

		if (isNode && this.#options.credentialsFile != null) {
		}
	}

	get options() {
		return this.#options;
	}

	// #region CRUD
	async find<T = KonectyDocument>(module: string, options: KonectyFindParams): Promise<KonectyFindResult<T & KonectyDocument>> {
		try {
			const params = new URLSearchParams();
			Object.keys(options).forEach(key => {
				if (key === 'fields') {
					params.set(key, (options.fields ?? []).map(String).join(','));
				} else {
					params.set(key, JSON.stringify(serializeDates(get(options, key))));
				}
			});
			const result = await fetch(`${this.#options.endpoint}/rest/data/${module}/find?${params.toString()}`, {
				method: 'GET',
				headers: {
					Authorization: `${this.#options.accessKey}`,
				},
			});
			if (result.status >= 400) {
				throw new Error(`${result.status} - ${result.statusText}`);
			}

			const body = await result.json();

			return deserializeDates(body) as KonectyFindResult<T & KonectyDocument>;
		} catch (err) {
			logger.error(err);

			return {
				success: false,
				errors: [{ message: (err as Error).message }],
			};
		}
	}

	async create<T = KonectyDocument>(module: string, data: object): Promise<KonectyFindResult<T & KonectyDocument>> {
		try {
			const result = await fetch(`${this.#options.endpoint}/rest/data/${module}`, {
				method: 'POST',
				headers: {
					Authorization: `${this.#options.accessKey}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(serializeDates(data)),
			});
			if (result.status >= 400) {
				throw new Error(`${result.status} - ${result.statusText}`);
			}

			const body = await result.json();

			return deserializeDates(body) as KonectyFindResult<T & KonectyDocument>;
		} catch (err) {
			logger.error(err);
			return {
				success: false,
				errors: [{ message: (err as Error).message }],
			};
		}
	}

	async update<T = KonectyDocument>(
		module: string,
		data: object,
		ids: object[],
	): Promise<KonectyFindResult<T & KonectyDocument>> {
		try {
			const result = await fetch(`${this.#options.endpoint}/rest/data/${module}`, {
				method: 'PUT',
				headers: {
					Authorization: `${this.#options.accessKey}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(serializeDates({ ids, data })),
			});
			if (result.status >= 400) {
				throw new Error(`${result.status} - ${result.statusText}`);
			}

			const body = await result.json();

			return deserializeDates(body) as KonectyFindResult<T & KonectyDocument>;
		} catch (err) {
			logger.error(err);
			return {
				success: false,
				errors: [{ message: (err as Error).message }],
			};
		}
	}

	async delete(module: string, ids: object[]): Promise<KonectyFindResult> {
		try {
			const result = await fetch(`${this.#options.endpoint}/rest/data/${module}`, {
				method: 'DELETE',
				headers: {
					Authorization: `${this.#options.accessKey}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(serializeDates({ ids })),
			});
			if (result.status >= 400) {
				throw new Error(`${result.status} - ${result.statusText}`);
			}

			const body = await result.json();

			return deserializeDates(body) as KonectyFindResult;
		} catch (err) {
			logger.error(err);
			return {
				success: false,
				errors: [{ message: (err as Error).message }],
			};
		}
	}

	// #endregion

	async getHistory(module: string, _id: string): Promise<KonectyFindResult<History>> {
		try {
			const result = await fetch(`${this.#options.endpoint}/rest/data/${module}/${_id}/history`, {
				method: 'GET',
				headers: {
					Authorization: `${this.#options.accessKey}`,
				},
			});

			if (result.status >= 400) {
				throw new Error(`${result.status} - ${result.statusText}`);
			}

			const body = await result.json();

			const deserializedDates = deserializeDates(body) as KonectyFindResult<History>;

			return {
				success: true,
				data: deserializedDates.data,
				total: deserializedDates.data?.length ?? 0,
			};
		} catch (err) {
			logger.error(err);
			return {
				success: false,
				errors: [{ message: (err as Error).message }],
			};
		}
	}

	async login(
		user: string,
		password: string,
		extraData?: {
			geolocation?: { longitude: number; latitude: number };
			resolution?: { width: number; height: number };
			source?: string;
		},
	): Promise<KonectyLoginResult> {
		try {
			const loginPayload = Object.assign(
				{
					user,

					password: crypto.createHash('md5').update(password).digest('hex'),
					password_SHA256: crypto.createHash('sha256').update(password).digest('hex'),
				},
				extraData ?? {},
			);
			const result = await fetch(`${this.#options.endpoint}/rest/auth/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
				},
				body: qs.stringify(loginPayload),
			});
			if (result.status >= 400) {
				throw new Error(`${result.status} - ${result.statusText}`);
			}

			const body = (await result.json()) as KonectyLoginResult;

			if (body.success) {
				this.#options.accessKey = body.authId;

				if (isBrowser) {
					Cookies.set('_authTokenId', body.authId as string);
				}
			}

			return body;
		} catch (err) {
			logger.error(err);
			return {
				success: false,
				errors: [(err as Error).message],
			};
		}
	}

	async getMenu(menu = 'main'): Promise<KonectyFindResult<Menu>> {
		try {
			const result = await fetch(`${this.#options.endpoint}/api/menu/${menu}`, {
				method: 'GET',
				headers: {
					Authorization: `${this.#options.accessKey}`,
				},
			});
			if (result.status >= 400) {
				throw new Error(`${result.status} - ${result.statusText}`);
			}

			const body = await result.json();

			return {
				success: true,
				data: deserializeDates(body),
			} as KonectyFindResult<Menu>;
		} catch (err) {
			logger.error(err);
			return {
				success: false,
				errors: [{ message: (err as Error).message }],
			};
		}
	}

	async getListView(module: string, id = 'Default'): Promise<KonectyGetMetaResult<List>> {
		try {
			const result = await fetch(`${this.#options.endpoint}/api/list-view/${module}/${id}`, {
				method: 'GET',
				headers: {
					Authorization: `${this.#options.accessKey}`,
				},
			});

			if (result.status >= 400) {
				throw new Error(`${result.status} - ${result.statusText}`);
			}

			const body = await result.json();

			return {
				success: true,
				data: deserializeDates(body),
			} as KonectyGetMetaResult<List>;
		} catch (err) {
			logger.error(err);

			return {
				success: false,
				errors: [(err as Error).message],
			};
		}
	}

	async getDocumentNew(name: string): Promise<KonectyGetMetaResult<DocumentTranslation>> {
		try {
			const result = await fetch(`${this.#options.endpoint}/api/document/${name}`, {
				method: 'GET',
				headers: {
					Authorization: `${this.#options.accessKey}`,
				},
			});

			if (result.status >= 400) {
				throw new Error(`${result.status} - ${result.statusText}`);
			}

			const body = await result.json();

			return {
				success: true,
				data: deserializeDates(body),
			} as KonectyGetMetaResult<DocumentTranslation>;
		} catch (err) {
			logger.error(err);

			return {
				success: false,
				errors: [(err as Error).message],
			};
		}
	}

	async getForm(module: string, id = 'Default'): Promise<KonectyGetMetaResult<any>> {
		try {
			const result = await fetch(`${this.#options.endpoint}/api/form/${module}/${id}`, {
				method: 'GET',
				headers: {
					Authorization: `${this.#options.accessKey}`,
				},
			});

			if (result.status >= 400) {
				throw new Error(`${result.status} - ${result.statusText}`);
			}

			const body = await result.json();

			return {
				success: true,
				data: deserializeDates(body),
			};
		} catch (err) {
			logger.error(err);

			return {
				success: false,
				errors: [(err as Error).message],
			};
		}
	}

	async getMetasByDocument(document: string): Promise<KonectyGetMetaResult<any[]>> {
		try {
			const result = await fetch(`${this.#options.endpoint}/api/metas/${document}`, {
				method: 'GET',
				headers: {
					Authorization: `${this.#options.accessKey}`,
				},
			});

			if (result.status >= 400) {
				throw new Error(`${result.status} - ${result.statusText}`);
			}

			const body = await result.json();

			return {
				success: true,
				data: deserializeDates(body) as any[],
			};
		} catch (err) {
			logger.error(err);

			return {
				success: false,
				errors: [(err as Error).message],
			};
		}
	}

	async info(token?: string): Promise<KonectyUserInfo> {
		try {
			const userToken = this.#getToken(token);

			if (userToken == null) {
				return { logged: false };
			}

			const result = await fetch(`${this.#options.endpoint}/rest/auth/info`, {
				method: 'GET',
				headers: {
					Authorization: userToken,
				},
			});

			if (result.status >= 400) {
				return { logged: false };
			}

			const body = (await result.json()) as KonectyUserInfo;

			if (body.logged) {
				this.#options.accessKey = userToken;

				if (isBrowser) {
					Cookies.set('_authTokenId', userToken);
				}
			}

			return body;
		} catch (err) {
			logger.error(err);
			return {
				logged: false,
			};
		}
	}

	async lookup<T>(module: string, field: string, search: string, options?: KonectyFindParams): Promise<KonectyFindResult<T>> {
		try {
			const params = new URLSearchParams();
			params.set('search', search);
			params.set('page', '1');
			params.set('start', '0');
			params.set('limit', '100');

			if (options != null) {
				Object.keys(options).forEach(key => {
					params.set(key, JSON.stringify(serializeDates(get(options, key))));
				});
			}

			const result = await fetch(`${this.#options.endpoint}/rest/data/${module}/lookup/${field}?${params.toString()}`, {
				method: 'GET',
				headers: {
					Authorization: `${this.#options.accessKey}`,
				},
			});
			if (result.status >= 400) {
				throw new Error(`${result.status} - ${result.statusText}`);
			}

			const body = await result.json();

			return deserializeDates(body) as KonectyFindResult<T>;
		} catch (err) {
			logger.error(err);
			return {
				success: false,
				errors: [(err as Error).message],
			};
		}
	}

	#getToken(token?: string): string | null | undefined {
		if (token != null) {
			return token;
		}
		if (isBrowser) {
			return Cookies.get('_authTokenId');
		}
	}

	async getDocuments(): Promise<KonectyFindResult> {
		try {
			const result = await fetch(`${this.#options.endpoint}/rest/menu/documents`, {
				method: 'GET',
				headers: {
					Authorization: `${this.#options.accessKey}`,
				},
			});
			if (result.status >= 400) {
				throw new Error(`${result.status} - ${result.statusText}`);
			}

			const body = await result.json();

			return {
				success: true,
				data: deserializeDates(body),
			} as KonectyFindResult;
		} catch (err) {
			logger.error(err);
			return {
				success: false,
				errors: [(err as Error).message],
			};
		}
	}

	async getDocument(name: string): Promise<KonectyFindResult> {
		try {
			const result = await fetch(`${this.#options.endpoint}/rest/menu/documents/${name}`, {
				method: 'GET',
				headers: {
					Authorization: `${this.#options.accessKey}`,
				},
			});
			if (result.status >= 400) {
				throw new Error(`${result.status} - ${result.statusText}`);
			}

			const body = await result.json();

			return {
				success: true,
				data: deserializeDates(body),
			} as KonectyFindResult;
		} catch (err) {
			logger.error(err);
			return {
				success: false,
				errors: [(err as Error).message],
			};
		}
	}

	async getNextOnQueue(queueId: string): Promise<KonectyNextOnQueueResult> {
		try {
			const result = await fetch(`${this.#options.endpoint}/rest/data/Queue/queue/next/${queueId}`, {
				method: 'GET',
				headers: {
					Authorization: `${this.#options.accessKey}`,
				},
			});
			if (result.status >= 400) {
				throw new Error(`${result.status} - ${result.statusText}`);
			}

			const body = await result.json();

			return deserializeDates(body) as KonectyNextOnQueueResult;
		} catch (err) {
			logger.error(err);
			return {
				success: false,
			};
		}
	}

	async getAddressByZipCode(zipCode: string): Promise<KonectyFindResult<ZipCodeEntry>> {
		try {
			const result = await fetch(`${this.#options.endpoint}/rest/dne/cep/${zipCode}`, {
				method: 'GET',
				headers: {
					Authorization: `${this.#options.accessKey}`,
				},
			});
			if (result.status >= 400) {
				throw new Error(`${result.status} - ${result.statusText}`);
			}

			const body = await result.json();

			return {
				success: true,
				data: deserializeDates(body),
			} as KonectyFindResult<ZipCodeEntry>;
		} catch (err) {
			logger.error(err);
			return {
				success: false,
				errors: [(err as Error).message],
			};
		}
	}

	async getAccesses(document: string): Promise<KonectyFindResult<MetaAccess>> {
		try {
			const result = await fetch(`${this.#options.endpoint}/rest/access/${document}`, {
				method: 'GET',
				headers: {
					Authorization: `${this.#options.accessKey}`,
				},
			});
			if (result.status >= 400) {
				throw new Error(`${result.status} - ${result.statusText}`);
			}

			const body = await result.json();

			return deserializeDates(body) as KonectyFindResult<MetaAccess>;
		} catch (err) {
			logger.error(err);
			return {
				success: false,
				errors: [(err as Error).message],
			};
		}
	}

	async getAccess(document: string, accessName: string): Promise<KonectyGetMetaResult<MetaAccess>> {
		const allAccesses = await this.getAccesses(document);
		if (allAccesses.success) {
			const access = allAccesses.data?.find(a => a.name === accessName);

			return { success: access != null, data: access, errors: access == null ? ['Access not found'] : undefined };
		}

		return allAccesses as KonectyGetMetaResult<MetaAccess>;
	}

	async updateAccess(
		document: string,
		accessName: string,
		payload: UpdateAccessPayload,
	): Promise<KonectyGetMetaResult<MetaAccess>> {
		try {
			const result = await fetch(`${this.#options.endpoint}/rest/access/${document}/${accessName}`, {
				method: 'PUT',
				headers: {
					Authorization: `${this.#options.accessKey}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(serializeDates(payload)),
			});
			if (result.status >= 400) {
				throw new Error(`${result.status} - ${result.statusText}`);
			}

			const body = await result.json();

			return deserializeDates(body) as KonectyGetMetaResult<MetaAccess>;
		} catch (err) {
			logger.error(err);
			return {
				success: false,
				errors: [(err as Error).message],
			};
		}
	}
}

function serializeDates(obj: unknown): unknown {
	if (obj instanceof Date) {
		return { $date: obj.toISOString() };
	}

	if (isArray(obj)) {
		return obj.map(serializeDates);
	}

	if (isObject(obj)) {
		return Object.keys(obj).reduce((acc, key) => Object.assign(acc, { [key]: serializeDates(get(obj, key)) }), {});
	}

	return obj;
}

function deserializeDates(obj: unknown): unknown {
	if (get(obj, '$date') != null) {
		return DateTime.fromISO(get(obj, '$date')).toJSDate();
	}
	if (typeof obj === 'string' && DateTime.fromISO(obj).isValid) {
		try {
			if (new Date(obj).toISOString() == obj) {
				return DateTime.fromISO(obj).toJSDate();
			}
		} catch (e) {}
	}

	if (isArray(obj)) {
		return obj.map(deserializeDates);
	}

	if (isObject(obj)) {
		return Object.keys(obj).reduce((acc, key) => Object.assign(acc, { [key]: deserializeDates(get(obj, key)) }), {});
	}

	return obj;
}
