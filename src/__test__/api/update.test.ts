import { KonectyClient } from '@konecty/sdk/Client';
import { expect } from 'chai';
import { DateTime } from 'luxon';
import { MockAgent, setGlobalDispatcher } from 'undici';
import insertResponse from '../fixtures/konecty/insert-response.json';
import { WebElement, WebElementModule } from '../fixtures/types/WebElement';
const agent = new MockAgent();
const client = agent.get('http://localhost:3000');

describe('Konecty Retrive Documents', () => {
	beforeAll(async () => {
		KonectyClient.defaults.endpoint = 'http://localhost:3000';
		KonectyClient.defaults.accessKey = 'fake-key';

		agent.disableNetConnect();

		setGlobalDispatcher(agent);
	});

	afterAll(async () => {
		await agent.close();
	});

	beforeEach(() => {
		client
			.intercept({
				path: '/rest/data/WebElement',
				method: 'PUT',
			})
			.reply(200, insertResponse);
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

		// Act
		const { success, data } = await webElementModule.update(webElement, [webElementId]);

		// Assert
		expect(success).to.be.true;
		expect(data).to.be.an('array').lengthOf(1);
	});
});
