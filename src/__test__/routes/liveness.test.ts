import createServer from '../../app';

describe('GET /liveness', () => {
	it('should return a 200 response', async () => {
		const server = await createServer();
		const response = await server.inject({
			method: 'GET',
			url: '/liveness',
		});

		expect(response.statusCode).toBe(200);
	});
});
