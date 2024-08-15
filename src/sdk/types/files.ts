import { KonectyResultError } from './konectyReturn';

export namespace KonFiles {
	export type FileConfig = {
		name: string;
		size: number;
		kind: string;
		key: string;
		etag?: string;
	};

	export type RecordData = {
		metaObject: string;
		fieldName: string;
		recordId: string;
		_updatedAt?: string | Date;
	};

	export type UploadResponse = KonFiles.FileConfig & Partial<KonectyResultError> & { success: boolean };
}
