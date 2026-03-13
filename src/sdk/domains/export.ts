import get from 'lodash/get';
import fetch from 'isomorphic-fetch';

import logger from '../../lib/logger';
import type { StreamFindParams } from './stream';

export type ExportClientOptions = {
	endpoint: string;
	accessKey?: string;
};

export type ExportListFormat = 'csv' | 'xlsx' | 'json';

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

function buildExportQueryParams(params?: Partial<StreamFindParams>): URLSearchParams {
	const searchParams = new URLSearchParams();
	if (params == null) return searchParams;
	(Object.keys(params) as Array<keyof StreamFindParams>).forEach(key => {
		const value = params[key];
		if (value === undefined) return;
		if (key === 'fields') {
			searchParams.set(key, (params.fields ?? []).map(String).join(','));
		} else {
			searchParams.set(key, typeof value === 'object' ? JSON.stringify(serializeDates(value)) : String(value));
		}
	});
	return searchParams;
}

/**
 * Export list as CSV, XLSX or JSON. Type xls is normalized to xlsx by the CRM.
 */
export async function exportList(
	opts: ExportClientOptions,
	module: string,
	listName: string,
	format: ExportListFormat,
	params?: Partial<StreamFindParams>,
): Promise<ArrayBuffer> {
	const type = format === 'xlsx' ? 'xlsx' : format;
	const searchParams = buildExportQueryParams(params);
	const url = `${opts.endpoint}/rest/data/${module}/list/${listName}/${type}?${searchParams.toString()}`;
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

	return response.arrayBuffer();
}
