import { KonectyClient } from '@konecty/sdk/Client';

import { expect } from 'chai';
import Cookie from 'js-cookie';
import { MockAgent, setGlobalDispatcher } from 'undici';

jest.mock('js-cookie');

const mockedCookie = Cookie as jest.Mocked<typeof Cookie>;

import userInfoResponse from '../fixtures/konecty/user-info.json';

const agent = new MockAgent();

const mockIsBrowserGetter = jest.fn();
jest.mock('browser-or-node', () => ({
	...jest.requireActual('browser-or-node'),
	get isBrowser() {
		return mockIsBrowserGetter();
	},
}));

describe('Konecty User Infos', () => {
	// let client: Interceptable;
	beforeAll(async () => {
		KonectyClient.defaults.endpoint = 'http://localhost:3000';

		agent.disableNetConnect();

		const client = agent.get('http://localhost:3000');

		client
			.intercept({
				path: '/rest/auth/info',
				method: 'GET',
			})
			.reply(res => {
				if (Array.from(res.headers.values()).includes('authorization')) {
					return {
						statusCode: 200,
						data: userInfoResponse,
					};
				}
				return {
					statusCode: 401,
					data: '',
				};
			});

		setGlobalDispatcher(agent);
	});

	afterAll(async () => {
		await agent.close();
	});

	it('Should return false to not logged user', async () => {
		// Arrange

		const konecty = new KonectyClient({ endpoint: 'http://localhost:3000' });

		// Act

		const { logged } = await konecty.info();

		// Assert
		expect(logged).to.be.false;
	});

	it('Should return login info for user in cookie', async () => {
		// Arrange

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		mockedCookie.get.mockReturnValue('fake-key');
		mockIsBrowserGetter.mockReturnValue(true);

		const konecty = new KonectyClient({ endpoint: 'http://localhost:3000' });

		// Act

		const { logged, user } = await konecty.info();

		// Assert
		expect(logged).to.be.true;
		expect(user).to.be.deep.equals(userInfoResponse.user);
	});
});
