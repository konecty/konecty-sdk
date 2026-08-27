import { KonectyClient } from '@konecty/sdk/Client';
import { expect } from 'chai';

import { rest } from 'msw';
import { server } from '../../__test__/setup-test';

const ENDPOINT = 'http://localhost:3000';

describe('Konecty Admin Credentials', () => {
	describe('listAllPats', () => {
		// Equivalent Python test: tests/test_admin.py::test_list_all_pats_returns_pats_and_legacy_tokens
		it('Should GET /api/admin/pats and return PATs plus legacy tokens across the namespace', async () => {
			// Arrange
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-admin-auth-id' });
			let receivedUrl = '';
			let receivedMethod = '';
			let receivedAuthorization: string | null = null;

			const overviewResponse = {
				success: true,
				data: {
					pats: [
						{ userId: 'user-1', userName: 'Jane Doe', patId: 'pat-1', name: 'CI deploy key', createdAt: '2026-01-01T00:00:00.000Z' },
					],
					legacyTokens: [{ userId: 'user-2', userName: 'Legacy Bot', legacy: true, fingerprint: 'abc123def456' }],
				},
			};

			server.use(
				rest.get(`${ENDPOINT}/api/admin/pats`, (req, res, ctx) => {
					receivedUrl = req.url.toString();
					receivedMethod = req.method;
					receivedAuthorization = req.headers.get('authorization');
					return res.once(ctx.status(200), ctx.json(overviewResponse));
				}),
			);

			// Act
			const result = await konecty.listAllPats();

			// Assert
			expect(receivedUrl).to.equal('http://localhost:3000/api/admin/pats');
			expect(receivedMethod).to.equal('GET');
			expect(receivedAuthorization).to.equal('fake-admin-auth-id');
			expect(result).to.deep.equal(overviewResponse);
		});

		// Equivalent Python test: tests/test_admin.py::test_list_all_pats_raises_forbidden_for_non_admin
		it('Should return the 403 error verbatim when the caller is not an admin', async () => {
			// Arrange
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-non-admin-auth-id' });

			server.use(
				rest.get(`${ENDPOINT}/api/admin/pats`, (req, res, ctx) => {
					return res.once(ctx.status(403), ctx.json({ success: false, errors: [{ message: 'Admin access required' }] }));
				}),
			);

			// Act
			const result = await konecty.listAllPats();

			// Assert
			expect(result).to.deep.equal({ success: false, errors: [{ message: 'Admin access required' }] });
		});
	});

	describe('revokeUserPat', () => {
		// Equivalent Python test: tests/test_admin.py::test_revoke_user_pat_interpolates_user_and_pat_id
		it('Should DELETE /api/admin/pats/:userId/:patId, distinct from the self-service revokePat', async () => {
			// Arrange
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-admin-auth-id' });
			let receivedUrl = '';
			let receivedMethod = '';

			server.use(
				rest.delete(`${ENDPOINT}/api/admin/pats/user-1/pat-1`, (req, res, ctx) => {
					receivedUrl = req.url.toString();
					receivedMethod = req.method;
					return res.once(ctx.status(200), ctx.json({ success: true, data: { success: true } }));
				}),
			);

			// Act
			const result = await konecty.revokeUserPat('user-1', 'pat-1');

			// Assert
			expect(receivedUrl).to.equal('http://localhost:3000/api/admin/pats/user-1/pat-1');
			expect(receivedMethod).to.equal('DELETE');
			expect(result).to.deep.equal({ success: true, data: { success: true } });
		});

		// Equivalent Python test: tests/test_admin.py::test_revoke_user_pat_raises_not_found
		it('Should return the 404 not-found error verbatim', async () => {
			// Arrange
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-admin-auth-id' });

			server.use(
				rest.delete(`${ENDPOINT}/api/admin/pats/user-1/missing-pat`, (req, res, ctx) => {
					return res.once(ctx.status(404), ctx.json({ success: false, errors: [{ message: 'PAT not found' }] }));
				}),
			);

			// Act
			const result = await konecty.revokeUserPat('user-1', 'missing-pat');

			// Assert
			expect(result).to.deep.equal({ success: false, errors: [{ message: 'PAT not found' }] });
		});
	});

	describe('revokeLegacyToken', () => {
		// Equivalent Python test: tests/test_admin.py::test_revoke_legacy_token_interpolates_user_id_and_fingerprint
		it('Should DELETE /api/admin/legacy-tokens/:userId/:fingerprint', async () => {
			// Arrange
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-admin-auth-id' });
			let receivedUrl = '';
			let receivedMethod = '';

			server.use(
				rest.delete(`${ENDPOINT}/api/admin/legacy-tokens/user-2/abc123def456`, (req, res, ctx) => {
					receivedUrl = req.url.toString();
					receivedMethod = req.method;
					return res.once(ctx.status(200), ctx.json({ success: true, data: { success: true } }));
				}),
			);

			// Act
			const result = await konecty.revokeLegacyToken('user-2', 'abc123def456');

			// Assert
			expect(receivedUrl).to.equal('http://localhost:3000/api/admin/legacy-tokens/user-2/abc123def456');
			expect(receivedMethod).to.equal('DELETE');
			expect(result).to.deep.equal({ success: true, data: { success: true } });
		});

		// Equivalent Python test: tests/test_admin.py::test_revoke_legacy_token_raises_not_found
		it('Should return the 404 not-found error verbatim when the fingerprint does not belong to the given userId', async () => {
			// Arrange
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-admin-auth-id' });
			let receivedUrl = '';
			let receivedMethod = '';

			server.use(
				rest.delete(`${ENDPOINT}/api/admin/legacy-tokens/user-2/unknown-fingerprint`, (req, res, ctx) => {
					receivedUrl = req.url.toString();
					receivedMethod = req.method;
					return res.once(ctx.status(404), ctx.json({ success: false, errors: [{ message: 'Legacy token not found' }] }));
				}),
			);

			// Act
			const result = await konecty.revokeLegacyToken('user-2', 'unknown-fingerprint');

			// Assert — the SDK never throws here: the body already carries a machine-readable result
			expect(receivedUrl).to.equal('http://localhost:3000/api/admin/legacy-tokens/user-2/unknown-fingerprint');
			expect(receivedMethod).to.equal('DELETE');
			expect(result).to.deep.equal({ success: false, errors: [{ message: 'Legacy token not found' }] });
		});
	});
});
