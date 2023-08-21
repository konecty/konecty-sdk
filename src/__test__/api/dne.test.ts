import { KonectyClient } from '@konecty/sdk/Client';
import { expect } from 'chai';
import dneResponse from '../fixtures/konecty/dne-byzip-response.json';

import { rest } from 'msw';
import { server } from '../../__test__/setup-test';

describe('Konecty Zip Codes', () => {
	beforeAll(async () => {
		KonectyClient.defaults.endpoint = 'http://localhost:3000';
		KonectyClient.defaults.accessKey = 'fake-key';
	});

	it('Should response address for zipcode', async () => {
		// Arrange
		const postalCode = '69902458';
		const client = new KonectyClient();

		server.use(
			rest.get(`http://localhost:3000/rest/dne/cep/${postalCode}`, (req, res, ctx) => {
				return res.once(ctx.status(200), ctx.json(dneResponse));
			}),
		);

		// Act
		const { success, data } = await client.getAddressByZipCode(postalCode);

		// Assert
		expect(success).to.be.true;
		expect(data).to.be.an('array').lengthOf(1);
		expect(data).to.be.eql(dneResponse);
	});
});
