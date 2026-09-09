import { KonectyClient } from '@konecty/sdk/Client';
import { expect } from 'chai';

import { rest } from 'msw';
import { server } from '../../__test__/setup-test';

import findNoResults from '../fixtures/konecty/find-no-results.json';

/**
 * Hub #4838 — contrato do header `Authorization` quando não há `accessKey`.
 *
 * `Client.ts` montava o header por template literal, então `accessKey` indefinido
 * virava a string `"undefined"`. O Konecty trata header vazio corretamente (cai
 * para o cookie `_authTokenId`), mas `"undefined"` tem 9 caracteres e passa como
 * token válido — `parseAuthorizationHeader` retorna antes do fallback de cookie
 * (`konecty/Konecty`, `src/imports/utils/sessionUtils.ts:4-38`). Resultado: sob
 * `HttpOnly` o SDK não apenas deixava de autenticar, ele impedia o servidor de
 * autenticar pelo cookie que o navegador já tinha enviado.
 */
describe('Konecty Client — header Authorization sem accessKey', () => {
	beforeEach(() => {
		KonectyClient.defaults.endpoint = 'http://localhost:3000';
		KonectyClient.defaults.accessKey = undefined;
	});

	it('Should never send the literal string "undefined" as a token', async () => {
		// Arrange
		const konecty = new KonectyClient({ endpoint: 'http://localhost:3000' });

		let authorization: string | null = 'REQUISICAO-NAO-FEITA';
		server.use(
			rest.get('http://localhost:3000/rest/data/User/find', (req, res, ctx) => {
				authorization = req.headers.get('authorization');
				return res.once(ctx.status(200), ctx.json(findNoResults));
			}),
		);

		// Act
		await konecty.find('User', { filter: {} });

		// Assert
		expect(authorization).to.not.equal('undefined');
		expect(authorization ?? '').to.equal('');
	});

	it('Should still send an explicit accessKey untouched', async () => {
		// Arrange
		const konecty = new KonectyClient({ endpoint: 'http://localhost:3000', accessKey: 'fake-key' });

		let authorization: string | null = null;
		server.use(
			rest.get('http://localhost:3000/rest/data/User/find', (req, res, ctx) => {
				authorization = req.headers.get('authorization');
				return res.once(ctx.status(200), ctx.json(findNoResults));
			}),
		);

		// Act
		await konecty.find('User', { filter: {} });

		// Assert
		expect(authorization).to.equal('fake-key');
	});
});
