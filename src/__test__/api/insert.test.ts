import { KonectyClient } from '@konecty/sdk/Client';
import { expect } from 'chai';
import insertResponse from '../fixtures/konecty/insert-response.json';
import { WebElement, WebElementModule } from '../fixtures/types/WebElement';

import { rest } from 'msw';
import { server } from '../../__test__/setup-test';

describe('Konecty Insert Documents', () => {
	beforeAll(async () => {
		KonectyClient.defaults.endpoint = 'http://localhost:3000';
		KonectyClient.defaults.accessKey = 'fake-key';
	});

	it('Should insert valid web element', async () => {
		// Arrange
		const webElementModule = new WebElementModule();

		const webElement: WebElement = {
			type: 'HTML',
			status: 'Ativo',
			name: 'web element name',
		};

		server.use(
			rest.post('http://localhost:3000/rest/data/WebElement', (req, res, ctx) => {
				return res.once(ctx.status(200), ctx.json(insertResponse));
			}),
		);

		// Act
		const { success, data } = await webElementModule.create(webElement);

		// Assert
		expect(success).to.be.true;
		expect(data).to.be.an('array').lengthOf(1);
	});
});
