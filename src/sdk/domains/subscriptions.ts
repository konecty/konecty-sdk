import fetch from 'isomorphic-fetch';

import logger from '../../lib/logger';

export type SubscriptionsClientOptions = {
	endpoint: string;
	accessKey?: string;
};

async function request<T>(
	opts: SubscriptionsClientOptions,
	method: string,
	module: string,
	dataId: string,
): Promise<T> {
	const url = `${opts.endpoint}/rest/subscriptions/${module}/${dataId}`;
	const res = await fetch(url, {
		method,
		headers: { Authorization: opts.accessKey ?? '' },
	});
	if (res.status >= 400) {
		const errBody = await res.text();
		logger.error(`${res.status} ${res.statusText}`, { url, body: errBody });
		throw new Error(`${res.status} - ${res.statusText}`);
	}
	return res.json() as Promise<T>;
}

export async function getSubscriptionStatus<T = unknown>(
	opts: SubscriptionsClientOptions,
	module: string,
	dataId: string,
): Promise<T> {
	return request(opts, 'GET', module, dataId);
}

export async function subscribe<T = unknown>(
	opts: SubscriptionsClientOptions,
	module: string,
	dataId: string,
): Promise<T> {
	return request(opts, 'POST', module, dataId);
}

export async function unsubscribe<T = unknown>(
	opts: SubscriptionsClientOptions,
	module: string,
	dataId: string,
): Promise<T> {
	return request(opts, 'DELETE', module, dataId);
}
