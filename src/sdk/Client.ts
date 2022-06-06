import crypto from 'crypto';
import fs from 'fs';
import ini from 'ini';
import get from 'lodash/get';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import { DateTime } from 'luxon';
import path from 'path';
import qs from 'qs';
import { fetch } from 'undici';
import getHomeDir from '../lib/getHomeDir';
import logger from '../lib/logger';

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
export class KonectyClient {
	static defaults: KonectyClientOptions = {};
	#options: KonectyClientOptions;
	constructor(options?: KonectyClientOptions) {
		if (options?.accessKey != null) {
			this.#options = options;
			return;
		}

		if (options?.credentialsFile != null || KonectyClient.defaults.accessKey == null) {
			try {
				const __dirname = path.resolve(process.env.INIT_CWD ?? './');
				const credentialsFile = options?.credentialsFile ?? path.resolve(getHomeDir() ?? '', '.konecty', 'credentials');

				const resolvedFilePath = /^\~/.test(credentialsFile)
					? path.resolve(credentialsFile.replace(/^\~/, getHomeDir() || ''))
					: path.resolve(__dirname, credentialsFile);

				const credentialsContent = fs.readFileSync(path.resolve(resolvedFilePath), 'utf8');

				const credentials = ini.parse(credentialsContent);

				if (credentials != null) {
					if (get(options, 'endpoint') != null && get(credentials, get(options, 'endpoint', '')) != null) {
						const hostCredentials = get(credentials, get(options, 'endpoint', ''));
						this.#options = {
							...KonectyClient.defaults,
							endpoint: get(hostCredentials, 'host'),
							accessKey: get(hostCredentials, 'authId'),
						};
						return;
					} else if (get(credentials, 'default') != null) {
						const defaultCredentials = get(credentials, get(options, 'endpoint', ''));
						this.#options = {
							...KonectyClient.defaults,
							endpoint: get(defaultCredentials, 'host'),
							accessKey: get(defaultCredentials, 'authId'),
						};
						return;
					}
				}
			} catch (error) {
				console.error(error);
			}
		}
		this.#options = Object.assign({}, KonectyClient.defaults, options ?? {});
	}

	get options() {
		return this.#options;
	}

	// #region CRUD
	async find(module: string, options: KonectyFindParams): Promise<KonectyFindResult> {
		try {
			const params = new URLSearchParams();
			Object.keys(options).forEach(key => {
				params.set(key, JSON.stringify(get(options, key)));
			});
			const result = await fetch(`${this.#options.endpoint}/rest/data/${module}/find?${params.toString()}`, {
				method: 'GET',
				headers: {
					Authorization: `${this.#options.accessKey}`,
				},
			});

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

	async getDocuments(): Promise<KonectyFindResult> {
		try {
			const result = await fetch(`${this.#options.endpoint}/rest/menu/documents`, {
				method: 'GET',
				headers: {
					Authorization: `${this.#options.accessKey}`,
				},
			});

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
