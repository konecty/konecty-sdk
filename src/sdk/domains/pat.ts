import fetch from 'isomorphic-fetch';

import logger from '../../lib/logger';

export type PatClientOptions = {
	endpoint: string;
	accessKey?: string;
};

export type PatError = { message: string; code?: string | number; details?: string };

export type CreatePatBody = {
	name: string;
	/** ISO date string. Must be in the future — the backend rejects an already-expired value. */
	expiresAt?: string;
};

/**
 * Show-once shape: `token` is the bearer credential in the clear and is never
 * retrievable again after this response (D2 in the backend — see patApi.ts).
 */
export type CreatePatData = { _id: string; token: string };

/** Listed shape — deliberately never carries `hashedToken` (PAT-02). */
export type PatEntry = {
	_id: string;
	name: string;
	createdAt?: string;
	expiresAt?: string;
	lastUsedAt?: string;
};

export type CreatePatResult = { success: true; data: CreatePatData } | { success: false; errors: PatError[] };
export type ListPatsResult = { success: true; data: PatEntry[] } | { success: false; errors: PatError[] };
export type RevokePatResult = { success: true } | { success: false; errors: PatError[] };

const base = (opts: PatClientOptions) => ({
	headers: { Authorization: opts.accessKey ?? '' },
	url: opts.endpoint,
});

async function parseJsonBody(res: Response): Promise<unknown | null> {
	try {
		return await res.json();
	} catch (err) {
		logger.error(err);
		return null;
	}
}

/**
 * POST /rest/auth/pat — creates a Personal Access Token for the caller's own
 * account. Requires a session/OAuth-authenticated caller (a PAT cannot mint
 * another PAT — D4 in the backend). Never throws on a 4xx/5xx: the response
 * body already carries a machine-readable `errors` array, so callers branch
 * on `result.success` instead of catching.
 */
export async function createPat(opts: PatClientOptions, body: CreatePatBody): Promise<CreatePatResult> {
	const { url, headers } = base(opts);
	const path = `${url}/rest/auth/pat`;
	try {
		const res = await fetch(path, {
			method: 'POST',
			headers: { ...headers, 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		});
		const parsed = await parseJsonBody(res);
		if (res.status >= 400) {
			logger.error(`${res.status} ${res.statusText}`, { url: path, body: parsed });
		}
		return (parsed as CreatePatResult) ?? { success: false, errors: [{ message: `${res.status} - ${res.statusText}` }] };
	} catch (err) {
		logger.error(err);
		return { success: false, errors: [{ message: (err as Error).message }] };
	}
}

/**
 * GET /rest/auth/pat — lists the caller's own Personal Access Tokens
 * (PAT-02). The list never includes `hashedToken`.
 */
export async function listPats(opts: PatClientOptions): Promise<ListPatsResult> {
	const { url, headers } = base(opts);
	const path = `${url}/rest/auth/pat`;
	try {
		const res = await fetch(path, { method: 'GET', headers });
		const parsed = await parseJsonBody(res);
		if (res.status >= 400) {
			logger.error(`${res.status} ${res.statusText}`, { url: path, body: parsed });
		}
		return (parsed as ListPatsResult) ?? { success: false, errors: [{ message: `${res.status} - ${res.statusText}` }] };
	} catch (err) {
		logger.error(err);
		return { success: false, errors: [{ message: (err as Error).message }] };
	}
}

/**
 * DELETE /rest/auth/pat/:id — revokes one of the caller's own Personal
 * Access Tokens (PAT-02). Self-scoped on the backend: an `id` belonging to
 * another user always responds 404, never revealing whether it exists
 * elsewhere.
 */
export async function revokePat(opts: PatClientOptions, id: string): Promise<RevokePatResult> {
	const { url, headers } = base(opts);
	const path = `${url}/rest/auth/pat/${id}`;
	try {
		const res = await fetch(path, { method: 'DELETE', headers });
		const parsed = await parseJsonBody(res);
		if (res.status >= 400) {
			logger.error(`${res.status} ${res.statusText}`, { url: path, body: parsed });
		}
		return (parsed as RevokePatResult) ?? { success: false, errors: [{ message: `${res.status} - ${res.statusText}` }] };
	} catch (err) {
		logger.error(err);
		return { success: false, errors: [{ message: (err as Error).message }] };
	}
}
