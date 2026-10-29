import { KonectyClient } from '@konecty/sdk/Client';
import { MCP_STATUS_REQUIRES_SESSION_CODE } from '@konecty/sdk/domains/mcpStatus';
import { expect } from 'chai';

import { rest } from 'msw';
import { server } from '../../__test__/setup-test';

const ENDPOINT = 'http://localhost:3000';

const STATUS = {
	access: 'write',
	connections: [
		{
			id: 'grant-1',
			clientName: 'Claude',
			agent: 'claude',
			scopes: ['read', 'write'],
			resource: 'https://tenant.test/mcp',
			connectedAt: '2026-10-01T10:00:00.000Z',
			lastActiveAt: '2026-10-28T12:00:00.000Z',
		},
	],
};

describe('Konecty MCP connection status (self-service)', () => {
	describe('getMcpStatus', () => {
		// Equivalent Python test: tests/test_mcp_status.py::test_get_mcp_status_returns_access_and_connections
		it('Should GET /rest/auth/mcp/status with the session header and return access + connections', async () => {
			// Arrange
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-session-auth-id' });
			let receivedUrl = '';
			let receivedMethod = '';
			let receivedAuthorization: string | null = null;

			server.use(
				rest.get(`${ENDPOINT}/rest/auth/mcp/status`, (req, res, ctx) => {
					receivedUrl = req.url.toString();
					receivedMethod = req.method;
					receivedAuthorization = req.headers.get('authorization');
					return res.once(ctx.status(200), ctx.json({ success: true, data: STATUS }));
				}),
			);

			// Act
			const result = await konecty.getMcpStatus();

			// Assert
			expect(receivedUrl).to.equal('http://localhost:3000/rest/auth/mcp/status');
			expect(receivedMethod).to.equal('GET');
			expect(receivedAuthorization).to.equal('fake-session-auth-id');
			expect(result).to.deep.equal({ success: true, data: STATUS });
		});

		// Equivalent Python test: tests/test_mcp_status.py::test_get_mcp_status_forwards_requires_session_error
		it('Should return the 403 body with the stable code instead of throwing when called with a non-session credential', async () => {
			// Arrange
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'kpat_fake' });
			const body = { success: false, errors: [{ message: 'session only', code: 'mcp-status-requires-session' }] };

			server.use(rest.get(`${ENDPOINT}/rest/auth/mcp/status`, (_req, res, ctx) => res.once(ctx.status(403), ctx.json(body))));

			// Act
			const result = await konecty.getMcpStatus();

			// Assert
			expect(result).to.deep.equal(body);
			expect(MCP_STATUS_REQUIRES_SESSION_CODE).to.equal('mcp-status-requires-session');
		});
	});

	describe('revokeMcpConnection', () => {
		// Equivalent Python test: tests/test_mcp_status.py::test_revoke_mcp_connection_encodes_id_in_path
		it('Should DELETE /rest/auth/mcp/connections/:id with the id percent-encoded byte for byte', async () => {
			// Arrange
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-session-auth-id' });
			let receivedUrl = '';
			let receivedMethod = '';

			server.use(
				rest.delete(`${ENDPOINT}/rest/auth/mcp/connections/:id`, (req, res, ctx) => {
					receivedUrl = req.url.href;
					receivedMethod = req.method;
					return res.once(ctx.status(200), ctx.json({ success: true }));
				}),
			);

			// Act
			const result = await konecty.revokeMcpConnection('grant 1/x');

			// Assert
			expect(receivedUrl).to.equal('http://localhost:3000/rest/auth/mcp/connections/grant%201%2Fx');
			expect(receivedMethod).to.equal('DELETE');
			expect(result).to.deep.equal({ success: true });
		});

		// Equivalent Python test: tests/test_mcp_status.py::test_revoke_mcp_connection_returns_not_found_body
		it('Should return the 404 body instead of throwing when the connection is unknown', async () => {
			// Arrange
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-session-auth-id' });
			const body = { success: false, errors: [{ message: 'MCP connection not found' }] };

			server.use(rest.delete(`${ENDPOINT}/rest/auth/mcp/connections/:id`, (_req, res, ctx) => res.once(ctx.status(404), ctx.json(body))));

			// Act
			const result = await konecty.revokeMcpConnection('nao-existe');

			// Assert
			expect(result).to.deep.equal(body);
		});
	});
});
