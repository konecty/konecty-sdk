import { isBrowser } from 'browser-or-node';
import crypto from 'crypto';
import Cookies from 'js-cookie';
import get from 'lodash/get';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import { DateTime } from 'luxon';
import qs from 'qs';
import { fetch } from 'undici';

import logger from '../lib/logger';
import { User } from './User';

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
};

export type KonectyFindResult = {
	success: boolean;
	total?: number;
	data?: Array<object>;
	errors?: string[];
};

export type KonectyLoginResult = {
	success: boolean;
	authId?: string;
	user?: {
		_id: string;
		locale: string;
	};
	errors?: string[];
};

export type KonectyUserInfo = {
	logged: boolean;
	user?: User;
};
export class KonectyClient {
	static defaults: KonectyClientOptions = {};
	#options: KonectyClientOptions;
	constructor(options?: KonectyClientOptions) {
		this.#options = Object.assign({}, KonectyClient.defaults, options);

		// if (isNode && this.#options.credentialsFile != null) {
		// 	import('../lib/loadCredentialsFromFile').then(module => {
		// 		const result = module.default(options);
		// 		if (result != null) {
		// 			this.#options = result;
		// 		}
		// 	});
		// }
	}

	get options() {
		return this.#options;
	}

	// #region CRUD
	async find(module: string, options: KonectyFindParams): Promise<KonectyFindResult> {
		try {
			const params = new URLSearchParams();
			Object.keys(options).forEach(key => {
				params.set(key, JSON.stringify(serializeDates(get(options, key))));
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

			return deserializeDates(body) as KonectyFindResult;
		} catch (err) {
			logger.error(err);
			return {
				success: false,
				errors: [(err as Error).message],
			};
		}
	}

	async create(module: string, data: object): Promise<KonectyFindResult> {
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

			return deserializeDates(body) as KonectyFindResult;
		} catch (err) {
			logger.error(err);
			return {
				success: false,
				errors: [(err as Error).message],
			};
		}
	}

	async update(module: string, data: object, ids: object[]): Promise<KonectyFindResult> {
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

			return deserializeDates(body) as KonectyFindResult;
		} catch (err) {
			logger.error(err);
			return {
				success: false,
				errors: [(err as Error).message],
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
				errors: [(err as Error).message],
			};
		}
	}

	// #endregion

	async login(user: string, password: string): Promise<KonectyLoginResult> {
		try {
			const loginPayload = {
				user,

				password: crypto.createHash('md5').update(password).digest('hex'),
				password_SHA256: crypto.createHash('sha256').update(password).digest('hex'),
			};
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
			}

			return body;
		} catch (err) {
			logger.error(err);
			return {
				logged: false,
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
		return DateTime.fromISO(obj).toJSDate();
	}

	if (isArray(obj)) {
		return obj.map(serializeDates);
	}

	if (isObject(obj)) {
		return Object.keys(obj).reduce((acc, key) => Object.assign(acc, { [key]: serializeDates(get(obj, key)) }), {});
	}

	return obj;
}
