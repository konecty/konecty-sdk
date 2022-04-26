import createServer from '../../src/app';

describe('GET /hello', () => {
	it('should return a 200 response', async () => {
		const server = await createServer();
		const response = await server.inject({
			method: 'GET',
			url: '/hello',
		});

		expect(response.statusCode).toBe(200);
	});
});
