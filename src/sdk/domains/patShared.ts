import fetch from 'isomorphic-fetch';

import logger from '../../lib/logger';

/**
 * Shared error shape returned in the `errors` array of every
 * `{ success: false, errors }` envelope across the PAT (`pat.ts`),
 * admin-credentials (`adminCredentials.ts`) and admin-service-accounts
 * (`adminServiceAccounts.ts`) domains. Each domain re-exports this under its
 * own public name (`PatError`, `AdminError`) to keep its existing surface,
 * but the shape is defined once here.
 */
export type SharedError = { message: string; code?: string | number; details?: string };

async function parseJsonBody(res: Response): Promise<unknown | null> {
	try {
		return await res.json();
	} catch (err) {
		logger.error(err);
		return null;
	}
}

/**
 * Shared fetch + parse + status-log + fallback-error helper for the PAT,
 * admin-credentials and admin-service-accounts domains — mirrors
 * `comments.ts`'s `handleResponse<T>`. Unlike `handleResponse`, this never
 * throws: the backends behind these three domains always return a
 * machine-readable `{ success: false, errors }` body on 4xx/5xx, so callers
 * branch on `result.success` instead of catching. On a network error, or a
 * response body that can't be parsed as JSON, falls back to a synthesized
 * `{ success: false, errors: [...] }` of the same shape.
 */
export async function request<T extends { success: boolean }>(path: string, init: RequestInit): Promise<T> {
	try {
		const res = await fetch(path, init);
		const parsed = await parseJsonBody(res);
		if (res.status >= 400) {
			logger.error(`${res.status} ${res.statusText}`, { url: path, body: parsed });
		}
		return (parsed as T) ?? ({ success: false, errors: [{ message: `${res.status} - ${res.statusText}` }] } as unknown as T);
	} catch (err) {
		logger.error(err);
		return { success: false, errors: [{ message: (err as Error).message }] } as unknown as T;
	}
}
