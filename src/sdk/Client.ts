import crypto from 'crypto';
import fs from 'fs';
import ini from 'ini';
import get from 'lodash/get';
import path from 'path';
import qs from 'qs';
import { fetch } from 'undici';
import getHomeDir from '../lib/getHomeDir';
import logger from '../lib/logger';

export interface KonectyClientOptions {
	credentialsFile?: string;
	endpoint?: string;
	accessKey?: string;
}

export type KonectyFindParams = {
	filter: object;
	start?: number;
	limit?: number;
	sort?: Array<object>;
};

export type KonectyFindResult = {
	success: boolean;
	total?: number;
	data?: Array<object>;
	errors?: string[];
};

export type KonectyLoginResult = {
	success: boolean;
	authId?: string;
	user?: {
		_id: string;
		locale: string;
	};
	errors?: string[];
};
export class KonectyClient {
	static defaults: KonectyClientOptions = {};
	_options: KonectyClientOptions;
	constructor(options?: KonectyClientOptions) {
		let credentialsFile;
		if (options != null) {
			credentialsFile = options?.credentialsFile;
			this._options = options;
			return;
		}

		credentialsFile = credentialsFile ?? path.resolve(getHomeDir() ?? '', '.konecty', 'credentials');

		try {
			const credentialsContent = fs.readFileSync(credentialsFile, 'utf8');

			const credentials = ini.parse(credentialsContent);

			if (get(options, 'endpoint') != null && get(credentials, get(options, 'endpoint', '')) != null) {
				this._options = {
					...KonectyClient.defaults,
					...credentials[get(options, 'endpoint', '')],
				};
				return;
			} else if (get(credentials, 'default') != null) {
				this._options = {
					...KonectyClient.defaults,
					...credentials['default'],
				};
				return;
			}
		} catch (_) {}
		this._options = KonectyClient.defaults;
	}

	async find(module: string, options: KonectyFindParams): Promise<KonectyFindResult> {
		try {
			const params = new URLSearchParams();
			Object.keys(options).forEach(key => {
				params.set(key, JSON.stringify(get(options, key)));
			});
			const result = await fetch(`${this._options.endpoint}/rest/data/${module}/find?${params.toString()}`, {
				method: 'GET',
				headers: {
					Authorization: `${this._options.accessKey}`,
				},
			});

			const body = await result.json();

			return body as KonectyFindResult;
		} catch (err) {
			logger.error(err);
			return {
				success: false,
				errors: [(err as Error).message],
			};
		}
	}

	async login(user: string, password: string): Promise<KonectyLoginResult> {
		try {
			const loginPayload = {
				user,

				password: crypto.createHash('md5').update(password).digest('hex'),
				password_SHA256: crypto.createHash('sha256').update(password).digest('hex'),
			};
			const result = await fetch(`${this._options.endpoint}/rest/auth/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
				},
				body: qs.stringify(loginPayload),
			});

			const body = await result.json();

			return body as KonectyLoginResult;
		} catch (err) {
			logger.error(err);
			return {
				success: false,
				errors: [(err as Error).message],
			};
		}
	}
}
