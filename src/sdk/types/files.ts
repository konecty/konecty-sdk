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
		recordId: string;
		fieldName: string;
	};
}
