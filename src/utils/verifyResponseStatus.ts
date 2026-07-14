import { KonectyResult } from '@konecty/sdk/types/konectyReturn';

export default async function verifyResponseStatus<ResponseType extends Partial<KonectyResult>>(response: Response) {
	if (response.status >= 400) {
		throw new Error(`${response.status} - ${response.statusText}`);
	}

	const responseData = (await response.json()) as ResponseType;
	if (responseData.success === false) {
		// fileRemove (and other core APIs) report failures with a singular `error` field
		throw new Error(responseData.errors?.map(error => error.message).join(', ') ?? (responseData as { error?: string }).error);
	}

	return responseData;
}
