import { KonectyClient } from '@konecty/sdk/Client';
import { expect } from 'chai';

import { rest } from 'msw';
import { server } from '../../__test__/setup-test';

const ENDPOINT = 'http://localhost:3000';

describe('Konecty Personal Access Tokens (self-service)', () => {
	describe('createPat', () => {
		// Equivalent Python test: tests/test_pat.py::test_create_pat_sends_expires_at_when_given
		// (konecty-sdk-python, branch feat/pat-service-accounts).
		it('Should POST to /rest/auth/pat with name and expiresAt, and return the show-once token', async () => {
			// Arrange
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-session-auth-id' });
			let receivedUrl = '';
			let receivedMethod = '';
			let receivedAuthorization: string | null = null;
			let receivedBody: unknown = null;

			server.use(
				rest.post(`${ENDPOINT}/rest/auth/pat`, async (req, res, ctx) => {
					receivedUrl = req.url.toString();
					receivedMethod = req.method;
					receivedAuthorization = req.headers.get('authorization');
					receivedBody = await req.json();
					return res.once(
						ctx.status(200),
						ctx.json({ success: true, data: { _id: 'pat-id-1', token: 'kpat_fake-clear-text-token' } }),
					);
				}),
			);

			// Act
			const result = await konecty.createPat('CI deploy key', '2099-01-01T00:00:00.000Z');

			// Assert — URL, method and body assembled byte-for-byte
			expect(receivedUrl).to.equal('http://localhost:3000/rest/auth/pat');
			expect(receivedMethod).to.equal('POST');
			expect(receivedAuthorization).to.equal('fake-session-auth-id');
			expect(receivedBody).to.deep.equal({ name: 'CI deploy key', expiresAt: '2099-01-01T00:00:00.000Z' });
			expect(result).to.deep.equal({ success: true, data: { _id: 'pat-id-1', token: 'kpat_fake-clear-text-token' } });
		});

		// Equivalent Python test: tests/test_pat.py::test_create_pat_sends_name_only_when_no_expiry
		it('Should omit expiresAt from the body when not given', async () => {
			// Arrange
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-session-auth-id' });
			let receivedBody: unknown = null;

			server.use(
				rest.post(`${ENDPOINT}/rest/auth/pat`, async (req, res, ctx) => {
					receivedBody = await req.json();
					return res.once(ctx.status(200), ctx.json({ success: true, data: { _id: 'pat-id-2', token: 'kpat_no-expiry' } }));
				}),
			);

			// Act
			await konecty.createPat('No expiry key');

			// Assert
			expect(receivedBody).to.deep.equal({ name: 'No expiry key' });
		});

		// Equivalent Python test: tests/test_pat.py::test_create_pat_raises_on_forbidden_role
		it('Should return the server errors verbatim on a 403 (role not allowed)', async () => {
			// Arrange
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-session-auth-id' });

			server.use(
				rest.post(`${ENDPOINT}/rest/auth/pat`, (req, res, ctx) => {
					return res.once(
						ctx.status(403),
						ctx.json({
							success: false,
							errors: [{ message: "User role is not allowed to create Personal Access Tokens — add the user's role to the Namespace mcpRoleIds configuration." }],
						}),
					);
				}),
			);

			// Act
			const result = await konecty.createPat('Blocked key');

			// Assert — the SDK never throws here: the body already carries a machine-readable result
			expect(result).to.deep.equal({
				success: false,
				errors: [{ message: "User role is not allowed to create Personal Access Tokens — add the user's role to the Namespace mcpRoleIds configuration." }],
			});
		});
	});

	describe('listPats', () => {
		// Equivalent Python test: tests/test_pat.py::test_list_pats_returns_data_without_hashed_token
		it('Should GET /rest/auth/pat and return the list without hashedToken', async () => {
			// Arrange
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-session-auth-id' });
			let receivedUrl = '';
			let receivedMethod = '';
			let receivedAuthorization: string | null = null;

			const listResponse = {
				success: true,
				data: [
					{ _id: 'pat-1', name: 'CI deploy key', createdAt: '2026-01-01T00:00:00.000Z', expiresAt: '2099-01-01T00:00:00.000Z', lastUsedAt: '2026-06-01T00:00:00.000Z' },
					{ _id: 'pat-2', name: 'No expiry key', createdAt: '2026-02-01T00:00:00.000Z' },
				],
			};

			server.use(
				rest.get(`${ENDPOINT}/rest/auth/pat`, (req, res, ctx) => {
					receivedUrl = req.url.toString();
					receivedMethod = req.method;
					receivedAuthorization = req.headers.get('authorization');
					return res.once(ctx.status(200), ctx.json(listResponse));
				}),
			);

			// Act
			const result = await konecty.listPats();

			// Assert
			expect(receivedUrl).to.equal('http://localhost:3000/rest/auth/pat');
			expect(receivedMethod).to.equal('GET');
			expect(receivedAuthorization).to.equal('fake-session-auth-id');
			expect(result).to.deep.equal(listResponse);
			if (result.success) {
				result.data.forEach(pat => expect(pat).to.not.have.property('hashedToken'));
			}
		});
	});

	describe('revokePat', () => {
		// Equivalent Python test: tests/test_pat.py::test_revoke_pat_builds_path_with_id
		it('Should DELETE /rest/auth/pat/:id', async () => {
			// Arrange
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-session-auth-id' });
			let receivedUrl = '';
			let receivedMethod = '';

			server.use(
				rest.delete(`${ENDPOINT}/rest/auth/pat/pat-id-1`, (req, res, ctx) => {
					receivedUrl = req.url.toString();
					receivedMethod = req.method;
					return res.once(ctx.status(200), ctx.json({ success: true }));
				}),
			);

			// Act
			const result = await konecty.revokePat('pat-id-1');

			// Assert
			expect(receivedUrl).to.equal('http://localhost:3000/rest/auth/pat/pat-id-1');
			expect(receivedMethod).to.equal('DELETE');
			expect(result).to.deep.equal({ success: true });
		});

		// Equivalent Python test: tests/test_pat.py::test_revoke_pat_raises_not_found_for_unknown_id
		it('Should return the 404 not-found error verbatim when the PAT does not belong to the caller', async () => {
			// Arrange
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-session-auth-id' });

			server.use(
				rest.delete(`${ENDPOINT}/rest/auth/pat/someone-elses-pat`, (req, res, ctx) => {
					return res.once(ctx.status(404), ctx.json({ success: false, errors: [{ message: 'Personal Access Token not found' }] }));
				}),
			);

			// Act
			const result = await konecty.revokePat('someone-elses-pat');

			// Assert
			expect(result).to.deep.equal({ success: false, errors: [{ message: 'Personal Access Token not found' }] });
		});
	});
});
