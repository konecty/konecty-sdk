import { KonectyClient } from '@konecty/sdk/Client';
import { expect } from 'chai';

import { rest } from 'msw';
import { server } from '../../__test__/setup-test';

const ENDPOINT = 'http://localhost:3000';

const googleSessionResponse = {
	success: true,
	logged: true,
	authId: 'not-a-real-auth-id',
	user: {
		_id: 'fake-user-id',
		access: { defaults: ['Default'] },
		admin: false,
		email: 'jane.doe@example.invalid',
		group: { _id: 'fake-group-id', name: 'Fake Group' },
		locale: 'pt_BR',
		login: 'jane.doe',
		name: 'Jane Doe',
		namespace: 'fake-namespace',
		role: { _id: 'fake-role-id', name: 'Fake Role' },
	},
};

describe('Konecty Google Login', () => {
	describe('getGoogleLoginUrl', () => {
		it('Should build the start URL with percent-encoded parameters', () => {
			// Arrange
			const konecty = new KonectyClient({ endpoint: ENDPOINT });

			// Act
			const url = konecty.getGoogleLoginUrl({
				clientId: 'my app',
				redirectUri: 'https://app.example.invalid/auth/callback?tenant=acme',
				state: 'a b&c=d/e?f#g+h',
			});

			// Assert
			expect(url).to.equal(
				'http://localhost:3000/api/auth/google/start' +
					'?client_id=my%20app' +
					'&redirect_uri=https%3A%2F%2Fapp.example.invalid%2Fauth%2Fcallback%3Ftenant%3Dacme' +
					'&state=a%20b%26c%3Dd%2Fe%3Ff%23g%2Bh',
			);
		});

		it('Should not perform any network request', async () => {
			// Arrange — the msw server is configured with onUnhandledRequest: 'error',
			// so an accidental request would fail this test.
			const konecty = new KonectyClient({ endpoint: ENDPOINT });

			// Act
			const url = konecty.getGoogleLoginUrl({
				clientId: 'webapp',
				redirectUri: 'https://app.example.invalid/cb',
				state: 'opaque-state',
			});

			// Assert
			expect(url).to.equal(
				'http://localhost:3000/api/auth/google/start?client_id=webapp&redirect_uri=https%3A%2F%2Fapp.example.invalid%2Fcb&state=opaque-state',
			);
		});
	});

	describe('exchangeGoogleCode', () => {
		it('Should return authId and user, and leave the client authenticated', async () => {
			// Arrange
			const konecty = new KonectyClient({ endpoint: ENDPOINT });
			let receivedBody: Record<string, unknown> = {};
			let authorizationOnNextRequest: string | null = null;

			server.use(
				rest.post(`${ENDPOINT}/api/auth/google/session`, async (req, res, ctx) => {
					receivedBody = await req.json();
					return res.once(ctx.status(200), ctx.json(googleSessionResponse));
				}),
				rest.get(`${ENDPOINT}/rest/data/Contact/find`, (req, res, ctx) => {
					authorizationOnNextRequest = req.headers.get('authorization');
					return res.once(ctx.status(200), ctx.json({ success: true, data: [], total: 0 }));
				}),
			);

			// Act
			const session = await konecty.exchangeGoogleCode('fake-single-use-code', {
				geolocation: { longitude: -46.63, latitude: -23.55 },
				resolution: { width: 1920, height: 1080 },
				source: 'web',
				fingerprint: 'fake-fingerprint',
			});
			await konecty.find('Contact', { filter: {} });

			// Assert
			expect(session.authId).to.equal(googleSessionResponse.authId);
			expect(session.user).to.deep.equal(googleSessionResponse.user);
			expect(session.user.namespace).to.equal('fake-namespace');
			expect(konecty.options.accessKey).to.equal(googleSessionResponse.authId);
			expect(authorizationOnNextRequest).to.equal(googleSessionResponse.authId);
			expect(receivedBody).to.deep.equal({
				code: 'fake-single-use-code',
				geolocation: { longitude: -46.63, latitude: -23.55 },
				resolution: { width: 1920, height: 1080 },
				source: 'web',
				fingerprint: 'fake-fingerprint',
			});
		});

		it('Should send only the code when no extra data is given', async () => {
			// Arrange
			const konecty = new KonectyClient({ endpoint: ENDPOINT });
			let receivedBody: Record<string, unknown> = {};

			server.use(
				rest.post(`${ENDPOINT}/api/auth/google/session`, async (req, res, ctx) => {
					receivedBody = await req.json();
					return res.once(ctx.status(200), ctx.json(googleSessionResponse));
				}),
			);

			// Act
			const session = await konecty.exchangeGoogleCode('fake-single-use-code');

			// Assert
			expect(receivedBody).to.deep.equal({ code: 'fake-single-use-code' });
			expect(session.authId).to.equal(googleSessionResponse.authId);
		});

		it('Should throw the server error message and keep the client unauthenticated', async () => {
			// Arrange
			const konecty = new KonectyClient({ endpoint: ENDPOINT });
			let authorizationOnNextRequest: string | null = null;

			server.use(
				rest.post(`${ENDPOINT}/api/auth/google/session`, (req, res, ctx) => {
					return res.once(
						ctx.status(400),
						ctx.json({
							success: false,
							errors: [
								{ message: 'Código de autenticação expirado', code: 'expired_code' },
								{ message: 'Should not be used', code: 'invalid_code' },
							],
						}),
					);
				}),
				rest.get(`${ENDPOINT}/rest/data/Contact/find`, (req, res, ctx) => {
					authorizationOnNextRequest = req.headers.get('authorization');
					return res.once(ctx.status(200), ctx.json({ success: true, data: [], total: 0 }));
				}),
			);

			// Act
			let thrown: Error | undefined;
			try {
				await konecty.exchangeGoogleCode('expired-fake-code');
			} catch (err) {
				thrown = err as Error;
			}
			await konecty.find('Contact', { filter: {} });

			// Assert
			expect(thrown).to.be.an('error');
			expect(thrown?.message).to.equal('Código de autenticação expirado');
			expect(konecty.options.accessKey).to.be.undefined;
			expect(authorizationOnNextRequest).to.equal('undefined');
		});

		it('Should not adopt an authId when a previous session is active and the exchange fails', async () => {
			// Arrange
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'previous-fake-auth-id' });

			server.use(
				rest.post(`${ENDPOINT}/api/auth/google/session`, (req, res, ctx) => {
					return res.once(
						ctx.status(400),
						ctx.json({ success: false, errors: [{ message: 'Usuário inativo', code: 'user_inactive' }] }),
					);
				}),
			);

			// Act
			let thrown: Error | undefined;
			try {
				await konecty.exchangeGoogleCode('fake-code-of-inactive-user');
			} catch (err) {
				thrown = err as Error;
			}

			// Assert
			expect(thrown?.message).to.equal('Usuário inativo');
			expect(konecty.options.accessKey).to.equal('previous-fake-auth-id');
		});
	});

	describe('getLoginOptions', () => {
		it('Should return the login option flags including googleEnabled', async () => {
			// Arrange
			const konecty = new KonectyClient({ endpoint: ENDPOINT });

			server.use(
				rest.get(`${ENDPOINT}/api/auth/login-options`, (req, res, ctx) => {
					return res.once(
						ctx.status(200),
						ctx.json({
							passwordEnabled: true,
							emailOtpEnabled: false,
							whatsAppOtpEnabled: false,
							webauthnEnabled: true,
							webauthnRequired: false,
							googleEnabled: true,
						}),
					);
				}),
			);

			// Act
			const options = await konecty.getLoginOptions();

			// Assert
			expect(options).to.deep.equal({
				passwordEnabled: true,
				emailOtpEnabled: false,
				whatsAppOtpEnabled: false,
				webauthnEnabled: true,
				webauthnRequired: false,
				googleEnabled: true,
			});
			expect(options.googleEnabled).to.be.true;
		});
	});
});
