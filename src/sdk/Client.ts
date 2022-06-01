import get from 'lodash/get';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import { DateTime } from 'luxon';
import { fetch } from 'undici';
import logger from '../lib/logger';
export interface KonectyClientOptions {
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
export class KonectyClient {
	static defaults: KonectyClientOptions = {};
	_options: KonectyClientOptions;
	constructor(options?: KonectyClientOptions) {
		if (options != null) {
			this._options = options;
			return;
		}
		this._options = KonectyClient.defaults;
	}

	async find(module: string, options: KonectyFindParams): Promise<KonectyFindResult> {
		try {
			const params = new URLSearchParams();
			Object.keys(options).forEach(key => {
				params.set(key, JSON.stringify(get(options, key)));
			});
			const result = await fetch(`${this._options.endpoint}/rest/data/${module}/find?${params.toString()}`, {
				method: 'GET',
				headers: {
					Authorization: `${this._options.accessKey}`,
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
			const result = await fetch(`${this._options.endpoint}/rest/data/${module}`, {
				method: 'POST',
				headers: {
					Authorization: `${this._options.accessKey}`,
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
			const result = await fetch(`${this._options.endpoint}/rest/data/${module}`, {
				method: 'PUT',
				headers: {
					Authorization: `${this._options.accessKey}`,
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
