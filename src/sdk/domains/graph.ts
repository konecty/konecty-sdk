import get from 'lodash/get';
import fetch from 'isomorphic-fetch';

import logger from '../../lib/logger';
import type { GraphConfig } from '../types/graph';
import type { StreamFindParams } from './stream';

export type GraphClientOptions = { endpoint: string; accessKey?: string };

function serializeDates(obj: unknown): unknown {
	if (obj instanceof Date) return { $date: obj.toISOString() };
	if (Array.isArray(obj)) return obj.map(serializeDates);
	if (obj != null && typeof obj === 'object') {
		return Object.keys(obj).reduce(
			(acc, key) => Object.assign(acc, { [key]: serializeDates(get(obj, key)) }),
			{},
		);
	}
	return obj;
}

function buildParams(graphConfig: GraphConfig, params?: Partial<StreamFindParams>): URLSearchParams {
	const searchParams = new URLSearchParams();
	searchParams.set('graphConfig', JSON.stringify(graphConfig));
	if (params != null) {
		(Object.keys(params) as Array<keyof StreamFindParams>).forEach(key => {
			const value = params[key];
			if (value === undefined) return;
			if (key === 'fields') {
				searchParams.set(key, (params.fields ?? []).map(String).join(','));
			} else {
				searchParams.set(key, typeof value === 'object' ? JSON.stringify(serializeDates(value)) : String(value));
			}
		});
	}
	return searchParams;
}

export async function getGraph(
	opts: GraphClientOptions,
	module: string,
	graphConfig: GraphConfig,
	params?: Partial<StreamFindParams>,
): Promise<string> {
	const searchParams = buildParams(graphConfig, params);
	const url = `${opts.endpoint}/rest/data/${module}/graph?${searchParams.toString()}`;
	const res = await fetch(url, {
		method: 'GET',
		headers: { Authorization: opts.accessKey ?? '' },
	});
	if (res.status >= 400) {
		const errBody = await res.text();
		logger.error(`${res.status} ${res.statusText}`, { url, body: errBody });
		throw new Error(`${res.status} - ${res.statusText}`);
	}
	return res.text();
}
