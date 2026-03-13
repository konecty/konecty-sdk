import get from 'lodash/get';
import fetch from 'isomorphic-fetch';

import { deserializeDates } from '../../utils/dateSerialization';
import { readNdjsonStream } from '../../utils/ndjson';
import logger from '../../lib/logger';

export type StreamClientOptions = {
	endpoint: string;
	accessKey?: string;
};

export type StreamFindParams = {
	filter: object;
	start?: number;
	limit?: number;
	sort?: Array<object>;
	fields?: Array<string | number | symbol>;
	displayName?: string;
	displayType?: string;
	withDetailFields?: boolean;
};

function serializeDates(obj: unknown): unknown {
	if (obj instanceof Date) {
		return { $date: obj.toISOString() };
	}
	if (Array.isArray(obj)) {
		return obj.map(serializeDates);
	}
	if (obj != null && typeof obj === 'object') {
		return Object.keys(obj).reduce(
			(acc, key) => Object.assign(acc, { [key]: serializeDates(get(obj, key)) }),
			{},
		);
	}
	return obj;
}

function buildFindQueryParams(params: StreamFindParams, includeTotal?: boolean): URLSearchParams {
	const searchParams = new URLSearchParams();
	Object.keys(params).forEach(key => {
		const value = (params as Record<string, unknown>)[key];
		if (value === undefined) return;
		if (key === 'fields') {
			searchParams.set(key, (params.fields ?? []).map(String).join(','));
		} else {
			searchParams.set(key, JSON.stringify(serializeDates(value)));
		}
	});
	if (includeTotal === true) {
		searchParams.set('includeTotal', '1');
	}
	return searchParams;
}

export type FindStreamResult<T> = {
	stream: AsyncGenerator<T>;
	total?: number;
};

export async function findStream<T = object>(
	opts: StreamClientOptions,
	module: string,
	options: StreamFindParams,
	includeTotal?: boolean,
): Promise<FindStreamResult<T>> {
	const params = buildFindQueryParams(options, includeTotal);
	const url = `${opts.endpoint}/rest/stream/${module}/findStream?${params.toString()}`;
	const response = await fetch(url, {
		method: 'GET',
		headers: {
			Authorization: opts.accessKey ?? '',
		},
	});

	if (response.status >= 400) {
		const errBody = await response.text();
		logger.error(`${response.status} ${response.statusText}`, { url, body: errBody });
		throw new Error(`${response.status} - ${response.statusText}`);
	}

	const total =
		includeTotal === true && response.headers.get('X-Total-Count') != null
			? parseInt(response.headers.get('X-Total-Count')!, 10)
			: undefined;

	let body: ReadableStream<Uint8Array> | null | string = response.body;
	if (body != null && typeof (body as ReadableStream).getReader !== 'function') {
		body = await response.text();
	}
	const stream = readNdjsonStream<T>(body, deserializeDates as (obj: unknown) => T);

	return { stream, total };
}

export type StreamCountResult = {
	success: boolean;
	total: number;
};

export async function streamCount(
	opts: StreamClientOptions,
	module: string,
	params: Pick<StreamFindParams, 'filter' | 'displayName' | 'displayType' | 'sort' | 'withDetailFields'>,
): Promise<StreamCountResult> {
	const searchParams = new URLSearchParams();
	Object.entries(params).forEach(([key, value]) => {
		if (value === undefined) return;
		searchParams.set(key, typeof value === 'object' ? JSON.stringify(serializeDates(value)) : String(value));
	});
	const url = `${opts.endpoint}/rest/stream/${module}/count?${searchParams.toString()}`;
	const response = await fetch(url, {
		method: 'GET',
		headers: {
			Authorization: opts.accessKey ?? '',
		},
	});

	if (response.status >= 400) {
		const errBody = await response.text();
		logger.error(`${response.status} ${response.statusText}`, { url, body: errBody });
		throw new Error(`${response.status} - ${response.statusText}`);
	}

	const body = (await response.json()) as StreamCountResult;
	return body;
}
