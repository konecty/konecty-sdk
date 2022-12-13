import { KonectyClient } from '@konecty/sdk/Client';
import { expect } from 'chai';
import { DateTime } from 'luxon';
import insertResponse from '../fixtures/konecty/insert-response.json';
import { WebElement, WebElementModule } from '../fixtures/types/WebElement';

import { rest } from 'msw';
import { server } from '../../__test__/setup-test';

describe('Konecty Retrive Documents', () => {
	beforeAll(async () => {
		KonectyClient.defaults.endpoint = 'http://localhost:3000';
		KonectyClient.defaults.accessKey = 'fake-key';
	});

	it('Should update web element slug', async () => {
		// Arrange
		const webElementModule = new WebElementModule();

		const webElement: WebElement = {
			slug: 'new-slug',
		};

		const webElementId = {
			_id: 'MfHqmdiHRv8Lnj6xW',
			_updatedAt: DateTime.fromISO('2022-06-01T20:56:33.039Z').toJSDate(),
		};

		server.use(
			rest.put('http://localhost:3000/rest/data/WebElement', (req, res, ctx) => {
				return res.once(ctx.status(200), ctx.json(insertResponse));
			}),
		);

		// Act
		const { success, data } = await webElementModule.update(webElement, [webElementId]);

		// Assert
		expect(success).to.be.true;
		expect(data).to.be.an('array').lengthOf(1);
	});

	it('Should clear web element slug', async () => {
		// Arrange
		const webElementModule = new WebElementModule();

		const webElement = {
			slug: null,
		};

		const webElementId = {
			_id: 'MfHqmdiHRv8Lnj6xW',
			_updatedAt: DateTime.fromISO('2022-06-01T20:56:33.039Z').toJSDate(),
		};

		server.use(
			rest.put('http://localhost:3000/rest/data/WebElement', (req, res, ctx) => {
				return res.once(ctx.status(200), ctx.json(insertResponse));
			}),
		);

		// Act
		const { success, data } = await webElementModule.update(webElement, [webElementId]);

		// Assert
		expect(success).to.be.true;
		expect(data).to.be.an('array').lengthOf(1);
	});
});
