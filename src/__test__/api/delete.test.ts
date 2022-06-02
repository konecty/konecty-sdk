import { KonectyClient } from '@konecty/sdk/Client';
import { expect } from 'chai';
import { DateTime } from 'luxon';
import { MockAgent, setGlobalDispatcher } from 'undici';
import { WebElementModule } from '../fixtures/types/WebElement';

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
				method: 'DELETE',
			})
			.reply(200, { success: true, data: ['MfHqmdiHRv8Lnj6xW'] });
	});

	it('Should remove web element', async () => {
		// Arrange
		const webElementModule = new WebElementModule();

		const webElementId = {
			_id: 'MfHqmdiHRv8Lnj6xW',
			_updatedAt: DateTime.fromISO('2022-06-01T22:20:46.253Z').toJSDate(),
		};

		// Act
		const { success, data } = await webElementModule.delete([webElementId]);

		// Assert
		expect(success).to.be.true;
		expect(data).to.be.an('array').lengthOf(1);
	});
});
