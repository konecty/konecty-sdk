import fetch from 'isomorphic-fetch';

import { deserializeDates } from '../../utils/dateSerialization';
import { readNdjsonStream } from '../../utils/ndjson';
import logger from '../../lib/logger';
import type { CrossModuleQuery } from '../types/crossModuleQuery';

export type QueryClientOptions = { endpoint: string; accessKey?: string };

export type ExecuteQueryJsonResult<T = object> = {
	stream: AsyncGenerator<T>;
	total?: number;
	meta?: unknown;
};

/**
 * POST /rest/query/json. Body is CrossModuleQuery (document, relations, filter, etc.).
 * Response is NDJSON; first line may be { _meta: ... } when includeMeta; X-Total-Count when includeTotal.
 */
export async function executeQueryJson<T = object>(
	opts: QueryClientOptions,
	body: CrossModuleQuery,
): Promise<ExecuteQueryJsonResult<T>> {
	const url = `${opts.endpoint}/rest/query/json`;
	const res = await fetch(url, {
		method: 'POST',
		headers: {
			Authorization: opts.accessKey ?? '',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});
	if (res.status >= 400) {
		const errBody = await res.text();
		logger.error(`${res.status} ${res.statusText}`, { url, body: errBody });
		throw new Error(`${res.status} - ${res.statusText}`);
	}
	const total =
		res.headers.get('X-Total-Count') != null
			? parseInt(res.headers.get('X-Total-Count')!, 10)
			: undefined;
	let streamBody: ReadableStream<Uint8Array> | null | string = res.body;
	if (streamBody != null && typeof (streamBody as ReadableStream).getReader !== 'function') {
		streamBody = await res.text();
	}
	const stream = readNdjsonStream<T>(streamBody, deserializeDates as (obj: unknown) => T);
	return { stream, total };
}

export type ExecuteQuerySqlOptions = { includeTotal?: boolean; includeMeta?: boolean };

export async function executeQuerySql<T = object>(
	opts: QueryClientOptions,
	sql: string,
	options?: ExecuteQuerySqlOptions,
): Promise<ExecuteQueryJsonResult<T>> {
	const url = `${opts.endpoint}/rest/query/sql`;
	const body = {
		sql,
		includeTotal: options?.includeTotal ?? true,
		includeMeta: options?.includeMeta ?? false,
	};
	const res = await fetch(url, {
		method: 'POST',
		headers: {
			Authorization: opts.accessKey ?? '',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});
	if (res.status >= 400) {
		const errBody = await res.text();
		logger.error(`${res.status} ${res.statusText}`, { url, body: errBody });
		throw new Error(`${res.status} - ${res.statusText}`);
	}
	const total =
		res.headers.get('X-Total-Count') != null
			? parseInt(res.headers.get('X-Total-Count')!, 10)
			: undefined;
	let streamBody: ReadableStream<Uint8Array> | null | string = res.body;
	if (streamBody != null && typeof (streamBody as ReadableStream).getReader !== 'function') {
		streamBody = await res.text();
	}
	const stream = readNdjsonStream<T>(streamBody, deserializeDates as (obj: unknown) => T);
	return { stream, total };
}

async function savedRequest<T>(
	opts: QueryClientOptions,
	method: string,
	path: string,
	body?: object,
): Promise<T> {
	const url = `${opts.endpoint}${path}`;
	const init: RequestInit = {
		method,
		headers: { Authorization: opts.accessKey ?? '' },
	};
	if (body != null) {
		(init.headers as Record<string, string>)['Content-Type'] = 'application/json';
		init.body = JSON.stringify(body);
	}
	const res = await fetch(url, init);
	if (res.status >= 400) {
		const errBody = await res.text();
		logger.error(`${res.status} ${res.statusText}`, { url, body: errBody });
		throw new Error(`${res.status} - ${res.statusText}`);
	}
	return res.json() as Promise<T>;
}

export function listSavedQueries<T = unknown>(opts: QueryClientOptions): Promise<T> {
	return savedRequest(opts, 'GET', '/rest/query/saved');
}

export function getSavedQuery<T = unknown>(opts: QueryClientOptions, id: string): Promise<T> {
	return savedRequest(opts, 'GET', `/rest/query/saved/${id}`);
}

export function createSavedQuery<T = unknown>(
	opts: QueryClientOptions,
	payload: { name: string; description?: string; query: Record<string, unknown> },
): Promise<T> {
	return savedRequest(opts, 'POST', '/rest/query/saved', payload);
}

export function updateSavedQuery<T = unknown>(
	opts: QueryClientOptions,
	id: string,
	payload: { name?: string; description?: string; query?: Record<string, unknown> },
): Promise<T> {
	return savedRequest(opts, 'PUT', `/rest/query/saved/${id}`, payload);
}

export function deleteSavedQuery<T = unknown>(opts: QueryClientOptions, id: string): Promise<T> {
	return savedRequest(opts, 'DELETE', `/rest/query/saved/${id}`);
}

export function shareSavedQuery<T = unknown>(
	opts: QueryClientOptions,
	id: string,
	payload: Record<string, unknown>,
): Promise<T> {
	return savedRequest(opts, 'PATCH', `/rest/query/saved/${id}/share`, payload);
}
