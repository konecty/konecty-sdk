import fetch from 'isomorphic-fetch';

import logger from '../../lib/logger';

export type CommentsClientOptions = {
	endpoint: string;
	accessKey?: string;
};

const base = (opts: CommentsClientOptions) => ({
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

export async function getComments<T = unknown>(
	opts: CommentsClientOptions,
	document: string,
	dataId: string,
): Promise<T> {
	const { url, headers } = base(opts);
	const res = await fetch(`${url}/rest/comment/${document}/${dataId}`, { method: 'GET', headers });
	return handleResponse(res, `${url}/rest/comment/${document}/${dataId}`);
}

export async function createComment<T = unknown>(
	opts: CommentsClientOptions,
	document: string,
	dataId: string,
	text: string,
	parentId?: string,
): Promise<T> {
	const { url, headers } = base(opts);
	const res = await fetch(`${url}/rest/comment/${document}/${dataId}`, {
		method: 'POST',
		headers: { ...headers, 'Content-Type': 'application/json' },
		body: JSON.stringify({ text, parentId }),
	});
	return handleResponse(res, `${url}/rest/comment/${document}/${dataId}`);
}

export async function updateComment<T = unknown>(
	opts: CommentsClientOptions,
	document: string,
	dataId: string,
	commentId: string,
	text: string,
): Promise<T> {
	const { url, headers } = base(opts);
	const res = await fetch(`${url}/rest/comment/${document}/${dataId}/${commentId}`, {
		method: 'PUT',
		headers: { ...headers, 'Content-Type': 'application/json' },
		body: JSON.stringify({ text }),
	});
	return handleResponse(res, `${url}/rest/comment/${document}/${dataId}/${commentId}`);
}

export async function deleteComment<T = unknown>(
	opts: CommentsClientOptions,
	document: string,
	dataId: string,
	commentId: string,
): Promise<T> {
	const { url, headers } = base(opts);
	const res = await fetch(`${url}/rest/comment/${document}/${dataId}/${commentId}`, {
		method: 'DELETE',
		headers,
	});
	return handleResponse(res, `${url}/rest/comment/${document}/${dataId}/${commentId}`);
}

export async function searchCommentUsers<T = unknown>(
	opts: CommentsClientOptions,
	document: string,
	dataId: string,
	query: string,
): Promise<T> {
	const { url, headers } = base(opts);
	const q = encodeURIComponent(query);
	const res = await fetch(`${url}/rest/comment/${document}/${dataId}/users/search?q=${q}`, {
		method: 'GET',
		headers,
	});
	return handleResponse(res, `${url}/rest/comment/${document}/${dataId}/users/search`);
}

export type SearchCommentsParams = {
	q?: string;
	authorId?: string;
	startDate?: string;
	endDate?: string;
	page?: number;
	limit?: number;
};

export async function searchComments<T = unknown>(
	opts: CommentsClientOptions,
	document: string,
	dataId: string,
	params?: SearchCommentsParams,
): Promise<T> {
	const { url, headers } = base(opts);
	const searchParams = new URLSearchParams();
	if (params != null) {
		Object.entries(params).forEach(([k, v]) => {
			if (v !== undefined && v !== '') searchParams.set(k, String(v));
		});
	}
	const qs = searchParams.toString();
	const path = `${url}/rest/comment/${document}/${dataId}/search${qs ? `?${qs}` : ''}`;
	const res = await fetch(path, { method: 'GET', headers });
	return handleResponse(res, path);
}
