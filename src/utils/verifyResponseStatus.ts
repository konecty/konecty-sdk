import { KonectyResult } from '@konecty/sdk/types/konectyReturn';

export default async function verifyResponseStatus<ResponseType extends Partial<KonectyResult>>(response: Response) {
	if (response.status >= 400) {
		throw new Error(`${response.status} - ${response.statusText}`);
	}

	const responseData = (await response.json()) as ResponseType;
	if (responseData.success === false) {
		throw new Error(responseData.errors?.map(error => error.message).join(', '));
	}

	return responseData;
}
