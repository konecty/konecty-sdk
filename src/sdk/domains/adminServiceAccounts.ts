import type { SharedError } from './patShared';
import { request } from './patShared';

export type AdminServiceAccountsClientOptions = {
	endpoint: string;
	accessKey?: string;
};

export type AdminError = SharedError;

export type AccessLevel = 'read' | 'readWrite';

export type CreateServiceAccountBody = {
	name: string;
	username: string;
	accessMap?: Record<string, AccessLevel>;
};

export type ServiceAccountRoleRef = { _id: string; name: string };

export type ServiceAccountCreated = {
	_id: string;
	username: string;
	role: ServiceAccountRoleRef;
	access: Record<string, unknown>;
	/** Present when the auto-provisioned role isn't yet in the Namespace's `mcpRoleIds` allowlist — REST access is unaffected. */
	mcpRoleHint?: string;
};

export type ServiceAccountPatEntry = {
	_id: string;
	name: string;
	createdAt?: string;
	expiresAt?: string;
	lastUsedAt?: string;
};

export type ServiceAccountSummary = {
	_id: string;
	name?: string;
	username?: string;
	active?: boolean;
	access: Record<string, unknown>;
	pats: ServiceAccountPatEntry[];
};

export type UpdateServiceAccountAccessBody = {
	accessMap?: Record<string, AccessLevel>;
};

export type CreateServiceAccountPatBody = {
	name: string;
	/** ISO date string. Must be in the future — the backend rejects an already-expired value. */
	expiresAt?: string;
};

/** Show-once shape: `token` is never retrievable again after this response. */
export type CreateServiceAccountPatData = { _id: string; token: string };

export type CreateServiceAccountResult = { success: true; data: ServiceAccountCreated } | { success: false; errors: AdminError[] };
export type ListServiceAccountsResult = { success: true; data: ServiceAccountSummary[] } | { success: false; errors: AdminError[] };
export type UpdateServiceAccountAccessResult =
	| { success: true; data: { _id: string; access: Record<string, unknown> } }
	| { success: false; errors: AdminError[] };
export type CreateServiceAccountPatResult = { success: true; data: CreateServiceAccountPatData } | { success: false; errors: AdminError[] };

const base = (opts: AdminServiceAccountsClientOptions) => ({
	headers: { Authorization: opts.accessKey ?? '' },
	url: opts.endpoint,
});

/**
 * POST /api/admin/service-accounts (SA-01) — creates a service-account User
 * with a sovereign `access` map (`{document -> 'read'|'readWrite'}`, applied
 * on top of `{defaults: false}`) instead of inheriting from a Role. Requires
 * an admin session.
 */
export async function createServiceAccount(opts: AdminServiceAccountsClientOptions, body: CreateServiceAccountBody): Promise<CreateServiceAccountResult> {
	const { url, headers } = base(opts);
	return request<CreateServiceAccountResult>(`${url}/api/admin/service-accounts`, {
		method: 'POST',
		headers: { ...headers, 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});
}

/**
 * GET /api/admin/service-accounts — lists every service account along with
 * its Personal Access Tokens. Never includes `hashedToken`. Requires an
 * admin session.
 */
export async function listServiceAccounts(opts: AdminServiceAccountsClientOptions): Promise<ListServiceAccountsResult> {
	const { url, headers } = base(opts);
	return request<ListServiceAccountsResult>(`${url}/api/admin/service-accounts`, { method: 'GET', headers });
}

/**
 * PUT /api/admin/service-accounts/:id/access — replaces the whole `access`
 * map of a service account from scratch, so a document dropped from the new
 * `accessMap` is actually removed rather than left stale. Requires an admin
 * session.
 */
export async function updateServiceAccountAccess(
	opts: AdminServiceAccountsClientOptions,
	id: string,
	body: UpdateServiceAccountAccessBody,
): Promise<UpdateServiceAccountAccessResult> {
	const { url, headers } = base(opts);
	return request<UpdateServiceAccountAccessResult>(`${url}/api/admin/service-accounts/${id}/access`, {
		method: 'PUT',
		headers: { ...headers, 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});
}

/**
 * POST /api/admin/service-accounts/:id/pats (ADM-02) — mints a Personal
 * Access Token for a service account on the admin's behalf. Requires an
 * admin session, and the backend refuses outright when `:id` doesn't
 * identify a service account — an admin never mints a PAT for a human.
 */
export async function createServiceAccountPat(
	opts: AdminServiceAccountsClientOptions,
	id: string,
	body: CreateServiceAccountPatBody,
): Promise<CreateServiceAccountPatResult> {
	const { url, headers } = base(opts);
	return request<CreateServiceAccountPatResult>(`${url}/api/admin/service-accounts/${id}/pats`, {
		method: 'POST',
		headers: { ...headers, 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});
}
