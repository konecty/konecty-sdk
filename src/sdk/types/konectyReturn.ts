export type KonectyError = {
	message: string;
	code?: number;
};

export type KonectyResult<T = unknown> = KonectyResultSuccess<T> | KonectyResultError;

export type KonectyResultSuccess<T = unknown> = {
	success: true;
	total?: number;
} & (T extends 'no-data' ? {} : { data: T });

export type KonectyResultError = {
	success: false;
	errors: Array<KonectyError>;
};
