export interface KonectyClientOptions {
	endpoint: string;
	accessKey: string;
}
export class KonectyClient {
	static defaults: KonectyClientOptions;
	_options: KonectyClientOptions;
	constructor(options?: KonectyClientOptions) {
		if (options != null) {
			this._options = options;
			return;
		}
		this._options = KonectyClient.defaults;
	}
}
