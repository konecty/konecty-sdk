import fetch from 'isomorphic-fetch';

import logger from '../../lib/logger';

export type ChangeUserClientOptions = {
	endpoint: string;
	accessKey?: string;
};

async function post<T>(
	opts: ChangeUserClientOptions,
	document: string,
	action: string,
	body: object,
): Promise<T> {
	const url = `${opts.endpoint}/rest/changeUser/${document}/${action}`;
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
	return res.json() as Promise<T>;
}

export async function changeUserAdd<T = unknown>(
	opts: ChangeUserClientOptions,
	document: string,
	ids: unknown[],
	data?: unknown,
): Promise<T> {
	return post(opts, document, 'add', { ids, data: data ?? {} });
}

export async function changeUserRemove<T = unknown>(
	opts: ChangeUserClientOptions,
	document: string,
	ids: unknown[],
	data?: unknown,
): Promise<T> {
	return post(opts, document, 'remove', { ids, data: data ?? {} });
}

export async function changeUserDefine<T = unknown>(
	opts: ChangeUserClientOptions,
	document: string,
	ids: unknown[],
	data?: unknown,
): Promise<T> {
	return post(opts, document, 'define', { ids, data: data ?? {} });
}

export async function changeUserReplace<T = unknown>(
	opts: ChangeUserClientOptions,
	document: string,
	ids: unknown[],
	data: { from?: string; to?: string },
): Promise<T> {
	return post(opts, document, 'replace', { ids, data });
}

export async function changeUserCountInactive<T = unknown>(
	opts: ChangeUserClientOptions,
	document: string,
	ids: unknown[],
): Promise<T> {
	return post(opts, document, 'countInactive', { ids });
}

export async function changeUserRemoveInactive<T = unknown>(
	opts: ChangeUserClientOptions,
	document: string,
	ids: unknown[],
): Promise<T> {
	return post(opts, document, 'removeInactive', { ids });
}

export async function changeUserSetQueue<T = unknown>(
	opts: ChangeUserClientOptions,
	document: string,
	ids: unknown[],
	data?: unknown,
): Promise<T> {
	return post(opts, document, 'setQueue', { ids, data: data ?? {} });
}
