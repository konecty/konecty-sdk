import verifyResponseStatus from '../../utils/verifyResponseStatus';

describe('verifyResponseStatus', () => {
	it('should return the parsed body when the response is successful', async () => {
		const response = {
			status: 200,
			json: jest.fn().mockResolvedValue({ success: true, data: [{ _id: 'id1' }] }),
		} as unknown as Response;

		await expect(verifyResponseStatus(response)).resolves.toEqual({ success: true, data: [{ _id: 'id1' }] });
	});

	it('should throw status and statusText for responses with status >= 400', async () => {
		const response = { status: 404, statusText: 'Not Found' } as unknown as Response;

		await expect(verifyResponseStatus(response)).rejects.toThrow('404 - Not Found');
	});

	it('should throw the joined messages when the body has errors[]', async () => {
		const response = {
			status: 200,
			json: jest.fn().mockResolvedValue({ success: false, errors: [{ message: 'first' }, { message: 'second' }] }),
		} as unknown as Response;

		await expect(verifyResponseStatus(response)).rejects.toThrow('first, second');
	});

	it('should fall back to the singular error field when errors[] is absent (fileRemove format)', async () => {
		const response = {
			status: 200,
			json: jest.fn().mockResolvedValue({ success: false, error: 'File with name [x] was not found' }),
		} as unknown as Response;

		await expect(verifyResponseStatus(response)).rejects.toThrow('File with name [x] was not found');
	});
});
