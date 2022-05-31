import get from 'lodash/get';
import { fetch } from 'undici';
import logger from '../lib/logger';
export interface KonectyClientOptions {
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
export class KonectyClient {
	static defaults: KonectyClientOptions = {};
	_options: KonectyClientOptions;
	constructor(options?: KonectyClientOptions) {
		if (options != null) {
			this._options = options;
			return;
		}
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
}
