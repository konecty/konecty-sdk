export interface KonectyClientOptions {
	endpoint: string;
	accessKey: string;
}
export class KonectyClient {
	_options: KonectyClientOptions;
	constructor(options: KonectyClientOptions) {
		this._options = options;
	}
}
