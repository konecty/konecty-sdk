import fetch from 'isomorphic-fetch';

import logger from '../../lib/logger';

export type NotificationsClientOptions = {
	endpoint: string;
	accessKey?: string;
};

const base = (opts: NotificationsClientOptions) => ({
	headers: { Authorization: opts.accessKey ?? '' },
	url: opts.endpoint,
});

async function handleResponse<T>(response: Response, url: string): Promise<T> {
	if (response.status >= 400) {
		const errBody = await response.text();
		logger.error(`${response.status} ${response.statusText}`, { url, body: errBody });
		throw new Error(`${response.status} - ${response.statusText}`);
	}
	return response.json() as Promise<T>;
}

export async function listNotifications<T = unknown>(
	opts: NotificationsClientOptions,
	params?: { read?: boolean; page?: number; limit?: number },
): Promise<T> {
	const { url, headers } = base(opts);
	const searchParams = new URLSearchParams();
	if (params?.read !== undefined) searchParams.set('read', String(params.read));
	if (params?.page !== undefined) searchParams.set('page', String(params.page));
	if (params?.limit !== undefined) searchParams.set('limit', String(params.limit));
	const qs = searchParams.toString();
	const path = `${url}/rest/notifications${qs ? `?${qs}` : ''}`;
	const res = await fetch(path, { method: 'GET', headers });
	return handleResponse(res, path);
}

export async function getUnreadNotificationCount<T = unknown>(
	opts: NotificationsClientOptions,
): Promise<T> {
	const { url, headers } = base(opts);
	const res = await fetch(`${url}/rest/notifications/unread-count`, { method: 'GET', headers });
	return handleResponse(res, `${url}/rest/notifications/unread-count`);
}

export async function markNotificationRead<T = unknown>(
	opts: NotificationsClientOptions,
	notificationId: string,
): Promise<T> {
	const { url, headers } = base(opts);
	const res = await fetch(`${url}/rest/notifications/${notificationId}/read`, {
		method: 'PUT',
		headers,
	});
	return handleResponse(res, `${url}/rest/notifications/${notificationId}/read`);
}

export async function markAllNotificationsRead<T = unknown>(
	opts: NotificationsClientOptions,
): Promise<T> {
	const { url, headers } = base(opts);
	const res = await fetch(`${url}/rest/notifications/read-all`, { method: 'PUT', headers });
	return handleResponse(res, `${url}/rest/notifications/read-all`);
}
