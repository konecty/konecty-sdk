import { KonectyClient } from '@konecty/sdk/Client';
import { expect } from 'chai';
import { MockAgent, setGlobalDispatcher } from 'undici';
import insertResponse from '../fixtures/konecty/insert-response.json';
import { WebElement, WebElementModule } from '../fixtures/types/WebElement';

const agent = new MockAgent();

describe('Konecty Retrive Documents', () => {
	beforeAll(async () => {
		KonectyClient.defaults.endpoint = 'http://localhost:3000';
		KonectyClient.defaults.accessKey = 'fake-key';

		agent.disableNetConnect();

		const client = agent.get('http://localhost:3000');
		client
			.intercept({
				path: '/rest/data/WebElement',
				method: 'POST',
			})
			.reply(200, insertResponse);

		setGlobalDispatcher(agent);
	});

	afterAll(async () => {
		await agent.close();
	});

	it('Should insert valid web element', async () => {
		// Arrange
		const webElementModule = new WebElementModule();

		const webElement: WebElement = {
			type: 'HTML',
			status: 'Ativo',
			name: 'web element name',
		};

		// Act
		const { success, data } = await webElementModule.create(webElement);

		// Assert
		expect(success).to.be.true;
		expect(data).to.be.an('array').lengthOf(1);
	});
});
