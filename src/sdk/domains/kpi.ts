import get from 'lodash/get';
import fetch from 'isomorphic-fetch';

import { deserializeDates } from '../../utils/dateSerialization';
import logger from '../../lib/logger';
import type { KpiConfig, KpiResult } from '../types/query';
import type { StreamFindParams } from './stream';

export type KpiClientOptions = {
	endpoint: string;
	accessKey?: string;
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

function buildKpiQueryParams(
	kpiConfig: KpiConfig,
	params?: Partial<StreamFindParams>,
): URLSearchParams {
	const searchParams = new URLSearchParams();
	searchParams.set('kpiConfig', JSON.stringify(kpiConfig));
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

export async function getKpi(
	opts: KpiClientOptions,
	module: string,
	kpiConfig: KpiConfig,
	params?: Partial<StreamFindParams>,
): Promise<KpiResult> {
	const searchParams = buildKpiQueryParams(kpiConfig, params);
	const url = `${opts.endpoint}/rest/data/${module}/kpi?${searchParams.toString()}`;
	const response = await fetch(url, {
		method: 'GET',
		headers: {
			Authorization: opts.accessKey ?? '',
		},
	});

	if (response.status === 304) {
		throw new Error('304 Not Modified — use ETag/If-None-Match for cache; SDK does not persist cache');
	}

	if (response.status >= 400) {
		const errBody = await response.text();
		logger.error(`${response.status} ${response.statusText}`, { url, body: errBody });
		throw new Error(`${response.status} - ${response.statusText}`);
	}

	const body = (await response.json()) as KpiResult;
	return deserializeDates(body) as KpiResult;
}
