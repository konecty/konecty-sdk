import fetch from 'isomorphic-fetch';

import logger from '../../lib/logger';

export type AdminCredentialsClientOptions = {
	endpoint: string;
	accessKey?: string;
};

export type AdminError = { message: string; code?: string | number; details?: string };

export type PatSummary = {
	userId: string;
	userName: string;
	patId: string;
	name: string;
	createdAt?: string;
	expiresAt?: string;
	lastUsedAt?: string;
};

export type LegacyTokenSummary = {
	userId: string;
	userName: string;
	legacy: true;
	fingerprint: string;
};

export type CredentialsOverview = {
	pats: PatSummary[];
	legacyTokens: LegacyTokenSummary[];
};

export type ListAllPatsResult = { success: true; data: CredentialsOverview } | { success: false; errors: AdminError[] };
export type AdminRevokeResult = { success: true; data: { success: true } } | { success: false; errors: AdminError[] };

const base = (opts: AdminCredentialsClientOptions) => ({
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
 * GET /api/admin/pats (ADM-01) — lists every Personal Access Token and every
 * legacy perpetual token (a `services.resume.loginTokens` entry with no
 * `when`) across the whole namespace. Requires an admin session. Legacy
 * entries never carry the raw credential, only a stable, non-reversible
 * `fingerprint`.
 */
export async function listAllPats(opts: AdminCredentialsClientOptions): Promise<ListAllPatsResult> {
	const { url, headers } = base(opts);
	const path = `${url}/api/admin/pats`;
	try {
		const res = await fetch(path, { method: 'GET', headers });
		const parsed = await parseJsonBody(res);
		if (res.status >= 400) {
			logger.error(`${res.status} ${res.statusText}`, { url: path, body: parsed });
		}
		return (parsed as ListAllPatsResult) ?? { success: false, errors: [{ message: `${res.status} - ${res.statusText}` }] };
	} catch (err) {
		logger.error(err);
		return { success: false, errors: [{ message: (err as Error).message }] };
	}
}

/**
 * DELETE /api/admin/pats/:userId/:patId — revokes a Personal Access Token
 * belonging to any user. Requires an admin session.
 *
 * Exported here as `revokePat`, exposed on {@link KonectyClient} as
 * `adminRevokePat` — the self-service equivalent (`pat.ts`) already owns the
 * flat `revokePat` name (single `id`, scoped to the caller's own account),
 * and the two operate on different resources (this one takes `userId` +
 * `patId`), so they cannot share a method name on the client.
 */
export async function revokePat(opts: AdminCredentialsClientOptions, userId: string, patId: string): Promise<AdminRevokeResult> {
	const { url, headers } = base(opts);
	const path = `${url}/api/admin/pats/${userId}/${patId}`;
	try {
		const res = await fetch(path, { method: 'DELETE', headers });
		const parsed = await parseJsonBody(res);
		if (res.status >= 400) {
			logger.error(`${res.status} ${res.statusText}`, { url: path, body: parsed });
		}
		return (parsed as AdminRevokeResult) ?? { success: false, errors: [{ message: `${res.status} - ${res.statusText}` }] };
	} catch (err) {
		logger.error(err);
		return { success: false, errors: [{ message: (err as Error).message }] };
	}
}

/**
 * DELETE /api/admin/legacy-tokens/:userId/:fingerprint — revokes a legacy
 * perpetual token identified by the fingerprint returned from
 * {@link listAllPats}. Requires an admin session.
 */
export async function revokeLegacyToken(opts: AdminCredentialsClientOptions, userId: string, fingerprint: string): Promise<AdminRevokeResult> {
	const { url, headers } = base(opts);
	const path = `${url}/api/admin/legacy-tokens/${userId}/${fingerprint}`;
	try {
		const res = await fetch(path, { method: 'DELETE', headers });
		const parsed = await parseJsonBody(res);
		if (res.status >= 400) {
			logger.error(`${res.status} ${res.statusText}`, { url: path, body: parsed });
		}
		return (parsed as AdminRevokeResult) ?? { success: false, errors: [{ message: `${res.status} - ${res.statusText}` }] };
	} catch (err) {
		logger.error(err);
		return { success: false, errors: [{ message: (err as Error).message }] };
	}
}
