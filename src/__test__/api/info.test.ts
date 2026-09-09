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

/**
 * Regressão da Hub #4838: sob `HttpOnly` o `_authTokenId` some do `document.cookie`
 * mas continua sendo enviado pelo navegador. O cliente desistia antes de perguntar
 * ao servidor — e, quando perguntava, mandava a string `"undefined"` no header, que
 * o Konecty aceita como token válido e nunca chega a olhar o cookie
 * (`konecty/Konecty`, `src/imports/utils/sessionUtils.ts:4-38`).
 */
describe('Konecty User Infos — sessão por cookie HttpOnly', () => {
	it('Should ask the server when the browser cannot read the cookie', async () => {
		// Arrange — browser, cookie existe mas é HttpOnly: `Cookies.get` não o enxerga
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		mockedCookie.get.mockReturnValue(undefined);
		mockIsBrowserGetter.mockReturnValue(true);

		const konecty = new KonectyClient({ endpoint: 'http://localhost:3000' });

		let authorization: string | null = 'REQUISICAO-NAO-FEITA';
		server.use(
			rest.get('http://localhost:3000/rest/auth/info', (req, res, ctx) => {
				authorization = req.headers.get('authorization');
				return res.once(ctx.status(200), ctx.json(userInfoResponse));
			}),
		);

		// Act
		const { logged, user } = await konecty.info();

		// Assert — a requisição saiu e a sessão foi adotada
		expect(logged).to.be.true;
		expect(user).to.be.deep.equals(userInfoResponse.user);

		// ...e o header não envenenou o fallback de cookie do servidor
		expect(authorization).to.not.equal('undefined');
		expect(authorization ?? '').to.equal('');
	});

	it('Should not write a cookie it never read', async () => {
		// Arrange
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		mockedCookie.get.mockReturnValue(undefined);
		mockIsBrowserGetter.mockReturnValue(true);

		const konecty = new KonectyClient({ endpoint: 'http://localhost:3000' });

		server.use(
			rest.get('http://localhost:3000/rest/auth/info', (req, res, ctx) => {
				return res.once(ctx.status(200), ctx.json(userInfoResponse));
			}),
		);

		// Act
		await konecty.info();

		// Assert — sem token em mãos não há o que gravar; o navegador já tem o cookie
		expect((mockedCookie.set as jest.Mock).mock.calls.length).to.equal(0);
		expect(konecty.options.accessKey).to.be.undefined;
	});

	it('Should still short-circuit in Node, where there is no ambient cookie', async () => {
		// Arrange
		mockIsBrowserGetter.mockReturnValue(false);

		const handler = jest.fn();
		server.use(
			rest.get('http://localhost:3000/rest/auth/info', (req, res, ctx) => {
				handler();
				return res.once(ctx.status(200), ctx.json(userInfoResponse));
			}),
		);

		const konecty = new KonectyClient({ endpoint: 'http://localhost:3000' });

		// Act
		const { logged } = await konecty.info();

		// Assert — nenhuma requisição inútil no caminho Node
		expect(logged).to.be.false;
		expect(handler.mock.calls.length).to.equal(0);
	});

	it('Should keep using an explicitly passed token', async () => {
		// Arrange
		mockIsBrowserGetter.mockReturnValue(true);

		const konecty = new KonectyClient({ endpoint: 'http://localhost:3000' });

		let authorization: string | null = null;
		server.use(
			rest.get('http://localhost:3000/rest/auth/info', (req, res, ctx) => {
				authorization = req.headers.get('authorization');
				return res.once(ctx.status(200), ctx.json(userInfoResponse));
			}),
		);

		// Act
		const { logged } = await konecty.info('token-explicito', true);

		// Assert
		expect(logged).to.be.true;
		expect(authorization).to.equal('token-explicito');
		expect(konecty.options.accessKey).to.equal('token-explicito');
	});
});
