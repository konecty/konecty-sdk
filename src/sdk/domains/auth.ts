import fetch from 'isomorphic-fetch';

import logger from '../../lib/logger';
import { UserGroupType, UserLocaleType, UserRoleType } from '../User';

export type AuthClientOptions = {
	endpoint: string;
	accessKey?: string;
};

export type GoogleLoginUrlParams = {
	clientId: string;
	redirectUri: string;
	state: string;
};

/**
 * Error codes the hosted callback may append to the app redirect_uri as `?error=<code>`.
 */
export type GoogleCallbackErrorCode =
	| 'access_denied'
	| 'provider_error'
	| 'email_not_verified'
	| 'user_not_found'
	| 'user_inactive'
	| 'ambiguous_user';

/**
 * Error codes returned by `POST /api/auth/google/session`.
 */
export type GoogleSessionErrorCode = 'invalid_code' | 'expired_code' | 'user_not_found' | 'user_inactive';

export type GoogleSessionUser = {
	_id: string;
	access?: object;
	admin?: boolean;
	email?: string;
	group?: UserGroupType;
	locale?: UserLocaleType;
	login?: string;
	name?: string;
	namespace?: string;
	role?: UserRoleType;
};

export type GoogleSessionExtraData = {
	geolocation?: { longitude: number; latitude: number };
	resolution?: { width: number; height: number };
	source?: string;
	fingerprint?: string;
};

export type GoogleSession = {
	authId: string;
	user: GoogleSessionUser;
};

export type GoogleSessionResponse = {
	success: boolean;
	logged?: boolean;
	authId?: string;
	user?: GoogleSessionUser;
	errors?: Array<{ message: string; code: GoogleSessionErrorCode | string }>;
};

export type LoginOptions = {
	passwordEnabled: boolean;
	emailOtpEnabled: boolean;
	whatsAppOtpEnabled: boolean;
	webauthnEnabled: boolean;
	webauthnRequired: boolean;
	googleEnabled: boolean;
};

/**
 * Builds the absolute URL of the Konecty-hosted Google authorization start endpoint.
 * Pure: performs no network request. The browser must be sent to this URL.
 */
export function getGoogleLoginUrl(opts: AuthClientOptions, params: GoogleLoginUrlParams): string {
	const query = [
		`client_id=${encodeURIComponent(params.clientId)}`,
		`redirect_uri=${encodeURIComponent(params.redirectUri)}`,
		`state=${encodeURIComponent(params.state)}`,
	].join('&');

	return `${opts.endpoint}/api/auth/google/start?${query}`;
}

/**
 * Exchanges the single-use code received on the app callback for a session.
 * The `authId` only ever travels in this response body — never in a URL.
 */
export async function exchangeGoogleCode(
	opts: AuthClientOptions,
	code: string,
	extraData?: GoogleSessionExtraData,
): Promise<GoogleSession> {
	const url = `${opts.endpoint}/api/auth/google/session`;

	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(Object.assign({ code }, extraData ?? {})),
	});

	const body = (await parseJsonBody(res)) as GoogleSessionResponse | null;

	if (res.status >= 400 || body?.success !== true || body?.authId == null || body?.user == null) {
		const message = body?.errors?.[0]?.message ?? `${res.status} - ${res.statusText}`;
		logger.error(`${res.status} ${res.statusText}`, { url, message });
		throw new Error(message);
	}

	return { authId: body.authId, user: body.user };
}

export async function getLoginOptions(opts: AuthClientOptions): Promise<LoginOptions> {
	const url = `${opts.endpoint}/api/auth/login-options`;

	const res = await fetch(url, {
		method: 'GET',
		headers: { Authorization: opts.accessKey ?? '' },
	});

	if (res.status >= 400) {
		const errBody = await res.text();
		logger.error(`${res.status} ${res.statusText}`, { url, body: errBody });
		throw new Error(`${res.status} - ${res.statusText}`);
	}

	return res.json() as Promise<LoginOptions>;
}

async function parseJsonBody(res: Response): Promise<unknown | null> {
	try {
		return await res.json();
	} catch (err) {
		logger.error(err);
		return null;
	}
}
