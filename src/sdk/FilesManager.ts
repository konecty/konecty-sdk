import fetch from 'isomorphic-fetch';

import { KonectyClientOptions } from '@konecty/sdk/Client';
import { KonFiles } from '@konecty/sdk/types/files';
import { KonectyResult } from '@konecty/sdk/types/konectyReturn';
import NodeFormData from 'form-data';
import verifyResponseStatus from 'utils/verifyResponseStatus';
import logger from '../lib/logger';

const endpoints = {
	upload: ({ metaObject, recordId, fieldName }: KonFiles.RecordData) =>
		`rest/file/upload/ns/access/${metaObject}/${recordId}/${fieldName}`,
	delete: ({ metaObject, recordId, fieldName }: KonFiles.RecordData, fileName: string) =>
		`rest/file/delete/ns/access/${metaObject}/${recordId}/${fieldName}/${fileName}`,
};

export class FilesManager {
	private files: File[] = [];
	private readonly konectyClientOpts: KonectyClientOptions;
	private readonly recordData: KonFiles.RecordData;

	private readonly baseUrl: string;

	constructor(
		konectyClientOpts: FilesManager['konectyClientOpts'],
		files: KonFiles.FileConfig[],
		recordData: FilesManager['recordData'],
	) {
		if (konectyClientOpts.fileManager?.providerUrl == null) {
			logger.warn('[FilesManager]: providerUrl is not defined');
		}

		this.konectyClientOpts = konectyClientOpts;
		this.baseUrl = konectyClientOpts.fileManager?.providerUrl ?? '';
		this.recordData = recordData;

		this.files = files.map(fileConfig => new File(fileConfig));
	}

	/**
	 * Upload **all and only files** present on the FormData.
	 * - If on the browser, *formData* will be the native {@link https://developer.mozilla.org/en-US/docs/Web/API/FormData | FormData}.
	 * - On Nodejs, it must be compatible with the package {@link https://npmjs.com/package/form-data | form-data}.
	 *
	 * @param formData - FormData with files to upload.
	 * @returns The uploaded file, on Konecty file format ({@link KonFiles.FileConfig}).
	 */
	public async upload(formData: FormData | NodeFormData): Promise<KonectyResult<KonFiles.FileConfig>> {
		try {
			const response = await fetch(`${this.baseUrl}/${endpoints.upload(this.recordData)}`, {
				body: formData,
				method: 'POST',
				headers: this._getHeaders(formData),
			});
			const responseData = await verifyResponseStatus<KonFiles.UploadResponse>(response);

			const file = new File(responseData);
			this.files.push(file);

			return { success: true, data: file.toJson() };
		} catch (e) {
			console.error(e);
			const error = e as Error;
			return { success: false, errors: [{ message: error.message }] };
		}
	}

	public async deleteFile(fileName: string): Promise<KonectyResult<'no-data'>> {
		try {
			const response = await fetch(`${this.baseUrl}/${endpoints.delete(this.recordData, fileName)}`, {
				method: 'DELETE',
				headers: this._getHeaders(),
			});

			await verifyResponseStatus(response);
			this.files = this.files.filter(file => file.name !== fileName);

			return { success: true };
		} catch (e) {
			console.error(e);
			const error = e as Error;
			return { success: false, errors: [{ message: error.message }] };
		}
	}

	public toJson(): KonFiles.FileConfig[] {
		return this.files.map(file => file.toJson());
	}

	private _getHeaders(formData?: FormData | NodeFormData) {
		let headers = {
			Authorization: this.konectyClientOpts.accessKey ?? '',
			Origin: this.konectyClientOpts.fileManager?.origin ?? '',
		};

		if (formData && 'window' in globalThis === false && 'getHeaders' in formData) {
			headers = {
				...formData.getHeaders(),
				...headers,
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
