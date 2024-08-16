import fetch from 'isomorphic-fetch';

import { KonectyClient, KonectyClientOptions } from '@konecty/sdk/Client';
import { KonFiles } from '@konecty/sdk/types/files';
import { KonectyResult, KonectyResultError } from '@konecty/sdk/types/konectyReturn';
import NodeFormData from 'form-data';
import logger from '../lib/logger';
import verifyResponseStatus from '../utils/verifyResponseStatus';

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

	/**
	 * Reorder a single file by the given position, then update the record on Konecty.
	 * @param fileName - The file name to reorder.
	 * @param newPosition - The new position of the file.
	 * @param reorderMode - The reorder mode. Default is 'push'.
	 * @returns The result of the update operation on Konecty.
	 *
	 * **Using push mode:**
	 * @example
	 * ```typescript
	 * const files = [{ name: 'file1' }, { name: 'file2' }, { name: 'file3' }, { name: 'file4' }];
	 * const filesManager = new FilesManager(konectyClientOpts, files, recordData);
	 *
	 * await filesManager.reorder('file2', 0, "push");
	 * filesManager.toJson();
	 * // [{ name: 'file2' }, { name: 'file1' }, { name: 'file3' }, { name: 'file4' }];
	 * ```
	 *
	 * **Using swap mode:**
	 * @example
	 * ```typescript
	 * const files = [{ name: 'file1' }, { name: 'file2' }, { name: 'file3' }, { name: 'file4' }];
	 * const filesManager = new FilesManager(konectyClientOpts, files, recordData);
	 *
	 * await filesManager.reorder('file2', 0, "swap");
	 * filesManager.toJson();
	 * // [{ name: 'file2' }, { name: 'file3' }, { name: 'file1' }, { name: 'file4' }];
	 * ```
	 */
	public reorder(fileName: string, newPosition: number, reorderMode?: 'swap' | 'push'): Promise<KonectyResult<'no-data'>>;

	/**
	 * Reorder multiple files using the given positions, then update the record on Konecty.
	 * **If there is missing files in the positions array, they'll be appended at the end as is.**
	 * @param positions - The new order of the files.
	 * @returns The result of the update operation on Konecty.
	 *
	 * @example
	 * ```typescript
	 * const files = [{ name: 'file1' }, { name: 'file2' }, { name: 'file3' }, { name: 'file4' }];
	 * const filesManager = new FilesManager(konectyClientOpts, files, recordData);
	 *
	 * await filesManager.reorder(['file4']);
	 * filesManager.toJson();
	 * // [{ name: 'file4' }, { name: 'file1' }, { name: 'file2' }, { name: 'file3' }];
	 *
	 * await filesManager.reorder(['file2', 'file1', 'file4', 'file3']);
	 * filesManager.toJson();
	 * // [{ name: 'file2' }, { name: 'file1' }, { name: 'file4' }, { name: 'file3' }];
	 * ```
	 */
	public reorder(positions: string[]): Promise<KonectyResult<'no-data'>>;
	public async reorder(
		fileNameOrPositions: string | string[],
		newPosition?: number,
		reorderMode: 'swap' | 'push' = 'push',
	): Promise<KonectyResult<'no-data'>> {
		if (typeof fileNameOrPositions === 'string') {
			const fileName = fileNameOrPositions;
			const file = this.files.find(file => file.name === fileName);
			if (!file) {
				return { success: false, errors: [{ message: `File ${fileName} not found` }] };
			}
			if (newPosition == null || newPosition < 0 || newPosition >= this.files.length) {
				return { success: false, errors: [{ message: `Invalid position ${newPosition}` }] };
			}

			const fileIndex = this.files.indexOf(file);
			if (newPosition === fileIndex) {
				return { success: false, errors: [{ message: `File is already at position` }] };
			}

			if (reorderMode === 'swap') {
				const otherFile = this.files[newPosition];

				this.files[fileIndex] = otherFile;
				this.files[newPosition] = file;
			} else {
				this.files.splice(newPosition, 0, this.files.splice(fileIndex, 1)[0]);
			}
		} else {
			const positions = fileNameOrPositions;
			const files = positions.map(fileName => this.files.find(file => file.name === fileName)).filter(Boolean);

			if (files.length !== this.files.length) {
				const missingFiles = this.files.filter(file => !files.includes(file));
				files.push(...missingFiles);
			}

			this.files = files as File[];
		}

		const konClient = new KonectyClient(this.konectyClientOpts);
		const { metaObject, recordId, fieldName, _updatedAt = '' } = this.recordData;

		const result = await konClient.update(metaObject, { [fieldName]: this.toJson() }, [
			{ _id: recordId, _updatedAt: new Date(_updatedAt) },
		]);
		if (!result.success) {
			return result as KonectyResultError;
		}

		this.recordData._updatedAt = new Date(result.data?.[0]._updatedAt ?? new Date());
		return { success: true };
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
