import { KonectyClient } from '@konecty/sdk/Client';
import { expect } from 'chai';

import { rest } from 'msw';
import { server } from '../../__test__/setup-test';

const ENDPOINT = 'http://localhost:3000';

describe('Konecty Admin Service Accounts', () => {
	describe('createServiceAccount', () => {
		// Equivalent Python test: tests/test_admin.py::test_create_service_account_sends_name_username_and_access_map
		it('Should POST /api/admin/service-accounts with name, username and accessMap', async () => {
			// Arrange
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-admin-auth-id' });
			let receivedUrl = '';
			let receivedMethod = '';
			let receivedBody: unknown = null;

			const createdResponse = {
				success: true,
				data: {
					_id: 'service-account-1',
					username: 'svc-crm-sync',
					role: { _id: 'role-service-account', name: 'Service Account' },
					access: { defaults: false, Contact: 'ServiceReadWrite', Opportunity: 'ServiceRead' },
				},
			};

			server.use(
				rest.post(`${ENDPOINT}/api/admin/service-accounts`, async (req, res, ctx) => {
					receivedUrl = req.url.toString();
					receivedMethod = req.method;
					receivedBody = await req.json();
					return res.once(ctx.status(201), ctx.json(createdResponse));
				}),
			);

			// Act
			const result = await konecty.createServiceAccount('CRM Sync', 'svc-crm-sync', {
				Contact: 'readWrite',
				Opportunity: 'read',
			});

			// Assert
			expect(receivedUrl).to.equal('http://localhost:3000/api/admin/service-accounts');
			expect(receivedMethod).to.equal('POST');
			expect(receivedBody).to.deep.equal({ name: 'CRM Sync', username: 'svc-crm-sync', accessMap: { Contact: 'readWrite', Opportunity: 'read' } });
			expect(result).to.deep.equal(createdResponse);
		});

		// Equivalent Python test: tests/test_admin.py::test_create_service_account_omits_access_map_when_none
		// Decision: the TS SDK's canonical behavior is to omit `accessMap` from
		// the wire body entirely when not passed (unlike the Python SDK, which
		// defaults it to `{}`) — this asserts that omission explicitly.
		it('Should omit accessMap from the body when not given', async () => {
			// Arrange
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-admin-auth-id' });
			let receivedBody: unknown = null;

			server.use(
				rest.post(`${ENDPOINT}/api/admin/service-accounts`, async (req, res, ctx) => {
					receivedBody = await req.json();
					return res.once(
						ctx.status(201),
						ctx.json({
							success: true,
							data: {
								_id: 'service-account-2',
								username: 'svc-no-access',
								role: { _id: 'role-service-account', name: 'Service Account' },
								access: { defaults: false },
							},
						}),
					);
				}),
			);

			// Act
			await konecty.createServiceAccount('No Access Sync', 'svc-no-access');

			// Assert — no accessMap key at all, not even accessMap: undefined
			expect(receivedBody).to.deep.equal({ name: 'No Access Sync', username: 'svc-no-access' });
			expect(receivedBody).to.not.have.property('accessMap');
		});

		// Equivalent Python test: tests/test_admin.py::test_create_service_account_raises_conflict_on_duplicate_username
		it('Should return the mcpRoleHint when present, and the 409 conflict verbatim on a duplicate username', async () => {
			// Arrange
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-admin-auth-id' });

			server.use(
				rest.post(`${ENDPOINT}/api/admin/service-accounts`, (req, res, ctx) => {
					return res.once(ctx.status(409), ctx.json({ success: false, errors: [{ message: 'Username already in use' }] }));
				}),
			);

			// Act
			const result = await konecty.createServiceAccount('CRM Sync', 'svc-crm-sync');

			// Assert
			expect(result).to.deep.equal({ success: false, errors: [{ message: 'Username already in use' }] });
		});
	});

	describe('listServiceAccounts', () => {
		// Equivalent Python test: tests/test_admin.py::test_list_service_accounts_returns_accounts_with_pats
		it('Should GET /api/admin/service-accounts and return each account with its PATs', async () => {
			// Arrange
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-admin-auth-id' });
			let receivedUrl = '';
			let receivedMethod = '';

			const listResponse = {
				success: true,
				data: [
					{
						_id: 'service-account-1',
						name: 'CRM Sync',
						username: 'svc-crm-sync',
						active: true,
						access: { defaults: false, Contact: 'ServiceReadWrite' },
						pats: [{ _id: 'pat-1', name: 'prod key', createdAt: '2026-01-01T00:00:00.000Z' }],
					},
				],
			};

			server.use(
				rest.get(`${ENDPOINT}/api/admin/service-accounts`, (req, res, ctx) => {
					receivedUrl = req.url.toString();
					receivedMethod = req.method;
					return res.once(ctx.status(200), ctx.json(listResponse));
				}),
			);

			// Act
			const result = await konecty.listServiceAccounts();

			// Assert
			expect(receivedUrl).to.equal('http://localhost:3000/api/admin/service-accounts');
			expect(receivedMethod).to.equal('GET');
			expect(result).to.deep.equal(listResponse);
		});
	});

	describe('updateServiceAccountAccess', () => {
		// Equivalent Python test: tests/test_admin.py::test_update_service_account_access_interpolates_id_and_sends_access_map
		it('Should PUT /api/admin/service-accounts/:id/access with accessMap', async () => {
			// Arrange
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-admin-auth-id' });
			let receivedUrl = '';
			let receivedMethod = '';
			let receivedBody: unknown = null;

			server.use(
				rest.put(`${ENDPOINT}/api/admin/service-accounts/service-account-1/access`, async (req, res, ctx) => {
					receivedUrl = req.url.toString();
					receivedMethod = req.method;
					receivedBody = await req.json();
					return res.once(
						ctx.status(200),
						ctx.json({ success: true, data: { _id: 'service-account-1', access: { defaults: false, Contact: 'ServiceRead' } } }),
					);
				}),
			);

			// Act
			const result = await konecty.updateServiceAccountAccess('service-account-1', { Contact: 'read' });

			// Assert
			expect(receivedUrl).to.equal('http://localhost:3000/api/admin/service-accounts/service-account-1/access');
			expect(receivedMethod).to.equal('PUT');
			expect(receivedBody).to.deep.equal({ accessMap: { Contact: 'read' } });
			expect(result).to.deep.equal({ success: true, data: { _id: 'service-account-1', access: { defaults: false, Contact: 'ServiceRead' } } });
		});

		// Equivalent Python test: tests/test_admin.py::test_update_service_account_access_raises_not_found
		it('Should return the 404 not-found error verbatim when the target does not exist', async () => {
			// Arrange
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-admin-auth-id' });

			server.use(
				rest.put(`${ENDPOINT}/api/admin/service-accounts/missing-id/access`, (req, res, ctx) => {
					return res.once(ctx.status(404), ctx.json({ success: false, errors: [{ message: 'Service account not found' }] }));
				}),
			);

			// Act
			const result = await konecty.updateServiceAccountAccess('missing-id', {});

			// Assert
			expect(result).to.deep.equal({ success: false, errors: [{ message: 'Service account not found' }] });
		});
	});

	describe('createServiceAccountPat', () => {
		// Equivalent Python test: tests/test_admin.py::test_create_service_account_pat_sends_expires_at_when_given
		it('Should POST /api/admin/service-accounts/:id/pats with name and expiresAt, returning the show-once token', async () => {
			// Arrange
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-admin-auth-id' });
			let receivedUrl = '';
			let receivedMethod = '';
			let receivedBody: unknown = null;

			server.use(
				rest.post(`${ENDPOINT}/api/admin/service-accounts/service-account-1/pats`, async (req, res, ctx) => {
					receivedUrl = req.url.toString();
					receivedMethod = req.method;
					receivedBody = await req.json();
					return res.once(ctx.status(201), ctx.json({ success: true, data: { _id: 'pat-9', token: 'kpat_service-account-token' } }));
				}),
			);

			// Act
			const result = await konecty.createServiceAccountPat('service-account-1', 'prod key', '2099-01-01T00:00:00.000Z');

			// Assert
			expect(receivedUrl).to.equal('http://localhost:3000/api/admin/service-accounts/service-account-1/pats');
			expect(receivedMethod).to.equal('POST');
			expect(receivedBody).to.deep.equal({ name: 'prod key', expiresAt: '2099-01-01T00:00:00.000Z' });
			expect(result).to.deep.equal({ success: true, data: { _id: 'pat-9', token: 'kpat_service-account-token' } });
		});

		// Equivalent Python test: tests/test_admin.py::test_create_service_account_pat_raises_for_non_service_account_target
		it('Should return the 403 error verbatim when the target is not a service account (ADM-02)', async () => {
			// Arrange
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-admin-auth-id' });

			server.use(
				rest.post(`${ENDPOINT}/api/admin/service-accounts/human-user-1/pats`, (req, res, ctx) => {
					return res.once(
						ctx.status(403),
						ctx.json({ success: false, errors: [{ message: 'Admin cannot create a Personal Access Token for a human user — target is not a service account (ADM-02)' }] }),
					);
				}),
			);

			// Act
			const result = await konecty.createServiceAccountPat('human-user-1', 'sneaky key');

			// Assert
			expect(result).to.deep.equal({
				success: false,
				errors: [{ message: 'Admin cannot create a Personal Access Token for a human user — target is not a service account (ADM-02)' }],
			});
		});
	});
});
