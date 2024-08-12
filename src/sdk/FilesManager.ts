import fetch from 'isomorphic-fetch';

import { KonectyClientOptions } from '@konecty/sdk/Client';
import { KonFiles } from '@konecty/sdk/types/files';
import { KonectyResult } from '@konecty/sdk/types/konectyReturn';
import NodeFormData from 'form-data';

const endpoints = {
	upload: ({ metaObject, recordId, fieldName }: KonFiles.RecordData) =>
		`rest/file/upload/ns/access/${metaObject}/${recordId}/${fieldName}`,
};

export class FilesManager {
	private files: File[] = [];
	private readonly konectyClientOpts: KonectyClientOptions;
	private readonly recordData: KonFiles.RecordData;

	constructor(
		konectyClientOpts: FilesManager['konectyClientOpts'],
		files: KonFiles.FileConfig[],
		recordData: FilesManager['recordData'],
	) {
		this.konectyClientOpts = konectyClientOpts;
		this.recordData = recordData;

		this.files = files.map(fileConfig => new File(fileConfig));
	}

	public async upload(formData: FormData | NodeFormData): Promise<KonectyResult<KonFiles.FileConfig>> {
		try {
			const response = await fetch(`${this.konectyClientOpts.filesProviderUrl}/${endpoints.upload(this.recordData)}`, {
				body: formData,
				method: 'POST',
				headers: this._getHeaders(formData),
			});
			const json = await response.json();
			console.log(json);
		} catch (e) {
			console.error(e);
		}
		return { success: false, errors: [] };
	}

	public toJson(): KonFiles.FileConfig[] {
		return this.files.map(file => file.toJson());
	}

	private _getHeaders(formData: FormData | NodeFormData) {
		let headers = {
			Authorization: this.konectyClientOpts.accessKey ?? '',
		};

		if ('window' in globalThis === false && 'getHeaders' in formData) {
			headers = {
				...headers,
				...formData.getHeaders(),
			};
		}

		return headers;
	}
}

class File {
	readonly name: string;
	readonly size: number;
	readonly kind: string;
	readonly key: string;

	constructor(fileConfig: KonFiles.FileConfig) {
		this.name = fileConfig.name;
		this.size = fileConfig.size;
		this.kind = fileConfig.kind;
		this.key = fileConfig.key;
	}

	toJson(): KonFiles.FileConfig {
		return {
			name: this.name,
			size: this.size,
			kind: this.kind,
			key: this.key,
		};
	}
}
