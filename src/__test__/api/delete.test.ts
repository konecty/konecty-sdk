import { KonectyClient } from '@konecty/sdk/Client';
import { expect } from 'chai';
import { DateTime } from 'luxon';

import { WebElementModule } from '../fixtures/types/WebElement';

import { rest } from 'msw';
import { server } from '../../__test__/setup-test';

describe('Konecty Retrive Documents', () => {
	beforeAll(async () => {
		KonectyClient.defaults.endpoint = 'http://localhost:3000';
		KonectyClient.defaults.accessKey = 'fake-key';
	});

	it('Should remove web element', async () => {
		// Arrange
		const webElementModule = new WebElementModule();

		const webElementId = {
			_id: 'MfHqmdiHRv8Lnj6xW',
			_updatedAt: DateTime.fromISO('2022-06-01T22:20:46.253Z').toJSDate(),
		};

		server.use(
			rest.delete('http://localhost:3000/rest/data/WebElement', (req, res, ctx) => {
				return res.once(ctx.status(200), ctx.json({ success: true, data: ['MfHqmdiHRv8Lnj6xW'] }));
			}),
		);

		// Act
		const { success, data } = await webElementModule.delete([webElementId]);

		// Assert
		expect(success).to.be.true;
		expect(data).to.be.an('array').lengthOf(1);
	});
});
