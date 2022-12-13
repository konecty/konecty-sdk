import { KonectyClient } from '@konecty/sdk/Client';

import { expect } from 'chai';
import Cookie from 'js-cookie';

import { rest } from 'msw';
import { server } from '../../__test__/setup-test';

jest.mock('js-cookie');

const mockedCookie = Cookie as jest.Mocked<typeof Cookie>;

import userInfoResponse from '../fixtures/konecty/user-info.json';

const mockIsBrowserGetter = jest.fn();
jest.mock('browser-or-node', () => ({
	...jest.requireActual('browser-or-node'),
	get isBrowser() {
		return mockIsBrowserGetter();
	},
}));

describe('Konecty User Infos', () => {
	it('Should return false to not logged user', async () => {
		// Arrange
		const konecty = new KonectyClient({ endpoint: 'http://localhost:3000' });

		server.use(
			rest.get('http://localhost:3000/rest/auth/info', (req, res, ctx) => {
				return res.once(ctx.status(401), ctx.text(''));
			}),
		);

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

		server.use(
			rest.get('http://localhost:3000/rest/auth/info', (req, res, ctx) => {
				return res.once(ctx.status(200), ctx.json(userInfoResponse));
			}),
		);

		// Act

		const { logged, user } = await konecty.info();

		// Assert
		expect(logged).to.be.true;
		expect(user).to.be.deep.equals(userInfoResponse.user);
	});
});
