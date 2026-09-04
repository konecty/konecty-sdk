import { KonectyClient } from '@konecty/sdk/Client';
import { expect } from 'chai';

import { rest } from 'msw';
import { server } from '../../__test__/setup-test';

const ENDPOINT = 'http://localhost:3000';

describe('Konecty Admin MCP Access', () => {
	describe('getMcpAccess', () => {
		// Equivalent Python test: tests/test_admin.py::test_get_mcp_access_returns_roles_and_lists
		it('Should GET /api/admin/mcp-access and return the roles plus both lists', async () => {
			// Arrange
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-admin-auth-id' });
			let receivedUrl = '';
			let receivedMethod = '';
			let receivedAuthorization: string | null = null;

			const configResponse = {
				success: true,
				data: {
					roles: [
						{ _id: 'role-r', name: 'Comercial' },
						{ _id: 'role-w', name: 'Integração' },
					],
					readRoleIds: ['role-r', 'role-w'],
					writeRoleIds: ['role-w'],
					readOnlyConfig: false,
				},
			};

			server.use(
				rest.get(`${ENDPOINT}/api/admin/mcp-access`, (req, res, ctx) => {
					receivedUrl = req.url.toString();
					receivedMethod = req.method;
					receivedAuthorization = req.headers.get('authorization');
					return res.once(ctx.status(200), ctx.json(configResponse));
				}),
			);

			// Act
			const result = await konecty.getMcpAccess();

			// Assert
			expect(receivedUrl).to.equal('http://localhost:3000/api/admin/mcp-access');
			expect(receivedMethod).to.equal('GET');
			expect(receivedAuthorization).to.equal('fake-admin-auth-id');
			expect(result).to.deep.equal(configResponse);
		});

		// Equivalent Python test: tests/test_admin.py::test_get_mcp_access_returns_forbidden_for_non_admin
		it('Should return the 403 error verbatim when the caller is not an admin', async () => {
			// Arrange
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-non-admin-auth-id' });

			server.use(
				rest.get(`${ENDPOINT}/api/admin/mcp-access`, (_req, res, ctx) => {
					return res.once(ctx.status(403), ctx.json({ success: false, errors: [{ message: 'Admin access required' }] }));
				}),
			);

			// Act
			const result = await konecty.getMcpAccess();

			// Assert
			expect(result).to.deep.equal({ success: false, errors: [{ message: 'Admin access required' }] });
		});
	});

	describe('updateMcpAccess', () => {
		// Equivalent Python test: tests/test_admin.py::test_update_mcp_access_sends_both_lists
		it('Should PUT /api/admin/mcp-access with both role lists', async () => {
			// Arrange
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-admin-auth-id' });
			let receivedUrl = '';
			let receivedMethod = '';
			let receivedBody: unknown = null;
			let receivedContentType: string | null = null;

			const updateResponse = { success: true, data: { readRoleIds: ['role-r', 'role-w'], writeRoleIds: ['role-w'] } };

			server.use(
				rest.put(`${ENDPOINT}/api/admin/mcp-access`, async (req, res, ctx) => {
					receivedUrl = req.url.toString();
					receivedMethod = req.method;
					receivedContentType = req.headers.get('content-type');
					receivedBody = await req.json();
					return res.once(ctx.status(200), ctx.json(updateResponse));
				}),
			);

			// Act
			const result = await konecty.updateMcpAccess({ readRoleIds: ['role-r', 'role-w'], writeRoleIds: ['role-w'] });

			// Assert
			expect(receivedUrl).to.equal('http://localhost:3000/api/admin/mcp-access');
			expect(receivedMethod).to.equal('PUT');
			expect(receivedContentType).to.equal('application/json');
			expect(receivedBody).to.deep.equal({ readRoleIds: ['role-r', 'role-w'], writeRoleIds: ['role-w'] });
			expect(result).to.deep.equal(updateResponse);
		});

		// Equivalent Python test: tests/test_admin.py::test_update_mcp_access_returns_unknown_role_error
		it('Should return the 400 unknown-role error verbatim', async () => {
			// Arrange
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-admin-auth-id' });

			server.use(
				rest.put(`${ENDPOINT}/api/admin/mcp-access`, (_req, res, ctx) => {
					return res.once(ctx.status(400), ctx.json({ success: false, errors: [{ message: 'Unknown role: role-x' }] }));
				}),
			);

			// Act
			const result = await konecty.updateMcpAccess({ readRoleIds: ['role-x'], writeRoleIds: [] });

			// Assert
			expect(result).to.deep.equal({ success: false, errors: [{ message: 'Unknown role: role-x' }] });
		});

		// Equivalent Python test: tests/test_admin.py::test_update_mcp_access_returns_read_only_config_error
		it('Should surface the 409 read-only-config code when the namespace comes from a metadata directory', async () => {
			// Arrange
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-admin-auth-id' });
			const conflict = {
				success: false,
				errors: [
					{
						message: 'MCP access is configured by the metadata directory in this deployment (METADATA_DIR) — edit Namespace.json there instead.',
						code: 'mcp-access-config-read-only',
					},
				],
			};

			server.use(
				rest.put(`${ENDPOINT}/api/admin/mcp-access`, (_req, res, ctx) => {
					return res.once(ctx.status(409), ctx.json(conflict));
				}),
			);

			// Act
			const result = await konecty.updateMcpAccess({ readRoleIds: ['role-r'], writeRoleIds: [] });

			// Assert
			expect(result).to.deep.equal(conflict);
		});
	});
});
