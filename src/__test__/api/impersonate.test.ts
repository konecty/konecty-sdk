import { KonectyClient, KonectyImpersonateError } from '@konecty/sdk/Client';
import { expect } from 'chai';

import { rest } from 'msw';
import { server } from '../../__test__/setup-test';

const ENDPOINT = 'http://localhost:3000';

const sessionData = {
	authId: 'not-a-real-support-auth-id',
	expiresAt: '2099-01-01T01:00:00.000Z',
	user: { _id: 'fake-target-id', name: 'Jane Doe', username: 'jane.doe' },
};

type Captured = {
	url: string;
	method: string;
	authorization: string | null;
	contentType: string | null;
	body: unknown;
	calls: number;
};

const captureRequest = (status: number, json: unknown): Captured => {
	const captured: Captured = { url: '', method: '', authorization: null, contentType: null, body: null, calls: 0 };

	server.use(
		rest.post(`${ENDPOINT}/api/auth/impersonate`, async (req, res, ctx) => {
			captured.calls += 1;
			captured.url = req.url.toString();
			captured.method = req.method;
			captured.authorization = req.headers.get('authorization');
			captured.contentType = req.headers.get('content-type');
			captured.body = await req.json();
			return res.once(ctx.status(status), ctx.json(json as object));
		}),
	);

	return captured;
};

const catchError = async (run: () => Promise<unknown>): Promise<unknown> => {
	try {
		await run();
	} catch (error) {
		return error;
	}
	return undefined;
};

/**
 * Equivalent Python tests: tests/test_auth_impersonate.py (konecty-sdk-python,
 * branch feat/auth-impersonate). Same inputs, same expected outputs.
 */
describe('Konecty impersonate (support session)', () => {
	// Equivalent Python test: tests/test_auth_impersonate.py::test_impersonate_by_user_id_sends_exact_request_and_parses
	it('Should POST { userId } to /api/auth/impersonate with the admin session and return authId, expiresAt and user', async () => {
		// Arrange
		const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-admin-session-id' });
		const captured = captureRequest(200, { success: true, data: sessionData });

		// Act
		const result = await konecty.impersonate({ userId: 'fake-target-id' });

		// Assert
		expect(captured.url).to.equal('http://localhost:3000/api/auth/impersonate');
		expect(captured.method).to.equal('POST');
		expect(captured.authorization).to.equal('fake-admin-session-id');
		expect(captured.contentType).to.equal('application/json');
		expect(captured.body).to.deep.equal({ userId: 'fake-target-id' });
		expect(result).to.deep.equal(sessionData);
	});

	// Equivalent Python test: tests/test_auth_impersonate.py::test_impersonate_by_code_sends_number_in_body
	it('Should POST { code } as a JSON number', async () => {
		// Arrange
		const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-admin-session-id' });
		const captured = captureRequest(200, { success: true, data: sessionData });

		// Act
		const result = await konecty.impersonate({ code: 6290 });

		// Assert
		expect(captured.body).to.deep.equal({ code: 6290 });
		expect(result.authId).to.equal('not-a-real-support-auth-id');
	});

	// Equivalent Python test: tests/test_auth_impersonate.py::test_impersonate_does_not_adopt_the_support_session
	it('Should not adopt the support session: the next call still carries the admin session', async () => {
		// Arrange
		const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-admin-session-id' });
		const first = captureRequest(200, { success: true, data: sessionData });
		await konecty.impersonate({ userId: 'fake-target-id' });
		const second = captureRequest(200, { success: true, data: sessionData });

		// Act
		await konecty.impersonate({ userId: 'fake-target-id' });

		// Assert
		expect(first.authorization).to.equal('fake-admin-session-id');
		expect(second.authorization).to.equal('fake-admin-session-id');
	});

	// Equivalent Python tests: tests/test_auth_impersonate.py::test_impersonate_raises_typed_error (parametrized, same table)
	const errorCases: Array<{ name: string; status: number; code: string | undefined; message: string; expectedCode: string }> = [
		{ name: '400 invalid target', status: 400, code: 'IMPERSONATE_INVALID_TARGET', message: 'Body must contain exactly one of userId or code', expectedCode: 'IMPERSONATE_INVALID_TARGET' },
		{ name: '401 unauthenticated', status: 401, code: undefined, message: 'Unauthorized', expectedCode: 'failed' },
		{ name: '403 caller is not admin', status: 403, code: 'IMPERSONATE_FORBIDDEN', message: 'Admin access required', expectedCode: 'IMPERSONATE_FORBIDDEN' },
		{ name: '403 target not allowed', status: 403, code: 'IMPERSONATE_TARGET_NOT_ALLOWED', message: 'Target not allowed', expectedCode: 'IMPERSONATE_TARGET_NOT_ALLOWED' },
		{ name: '403 caller is a support session', status: 403, code: 'IMPERSONATED_SESSION_FORBIDDEN', message: 'Support session cannot do this', expectedCode: 'IMPERSONATED_SESSION_FORBIDDEN' },
		{ name: '403 credential routes require session', status: 403, code: 'admin-credential-routes-require-session', message: 'Requires a first-party session', expectedCode: 'admin-credential-routes-require-session' },
		{ name: '404 target not found', status: 404, code: 'IMPERSONATE_TARGET_NOT_FOUND', message: 'Target not found', expectedCode: 'IMPERSONATE_TARGET_NOT_FOUND' },
		{ name: '500 without code', status: 500, code: undefined, message: 'Internal server error', expectedCode: 'failed' },
	];

	errorCases.forEach(({ name, status, code, message, expectedCode }) => {
		it(`Should throw KonectyImpersonateError with code "${expectedCode}" on ${name}`, async () => {
			// Arrange
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-admin-session-id' });
			captureRequest(status, { success: false, errors: [code == null ? { message } : { message, code }] });

			// Act
			const thrown = await catchError(() => konecty.impersonate({ userId: 'fake-target-id' }));

			// Assert
			expect(thrown).to.be.instanceOf(KonectyImpersonateError);
			expect((thrown as KonectyImpersonateError).code).to.equal(expectedCode);
			expect((thrown as KonectyImpersonateError).message).to.equal(message);
		});
	});

	// Equivalent Python test: tests/test_auth_impersonate.py::test_impersonate_rejects_zero_or_two_targets_without_request
	it('Should throw IMPERSONATE_INVALID_TARGET without sending a request when the target has zero or two keys', async () => {
		// Arrange
		const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-admin-session-id' });
		const captured = captureRequest(200, { success: true, data: sessionData });
		const invalidTargets = [{}, { userId: 'fake-target-id', code: 6290 }] as unknown as Array<{ userId: string }>;

		for (const target of invalidTargets) {
			// Act
			const thrown = await catchError(() => konecty.impersonate(target));

			// Assert
			expect(thrown).to.be.instanceOf(KonectyImpersonateError);
			expect((thrown as KonectyImpersonateError).code).to.equal('IMPERSONATE_INVALID_TARGET');
		}
		expect(captured.calls).to.equal(0);
	});
});
