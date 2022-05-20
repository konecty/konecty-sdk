import { KonectyClient, KonectyClientOptions } from './KonectyClient';

describe('Konecty Client Tests', () => {
	it('should create a client', () => {
		// Arrange
		const options: KonectyClientOptions = {
			endpoint: 'http://localhost:3000',
			accessKey: 'asdfasdfsadfsadf',
		};
		// Act
		const client = new KonectyClient(options);

		// Assert
		expect(client).toBeDefined();
	});
});
