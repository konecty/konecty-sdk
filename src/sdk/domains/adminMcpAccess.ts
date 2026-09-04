import type { SharedError } from './patShared';
import { request } from './patShared';

export type AdminMcpAccessClientOptions = {
	endpoint: string;
	accessKey?: string;
};

export type AdminError = SharedError;

export type McpAccessRole = {
	_id: string;
	name?: string;
	admin?: boolean;
};

export type McpAccessConfig = {
	/** Every role in the namespace, so a caller can render the full picture. */
	roles: McpAccessRole[];
	/** Roles allowed to reach the MCP. A role in `writeRoleIds` also reads, whether or not it is listed here. */
	readRoleIds: string[];
	/** Roles allowed to use write/destructive MCP tools. */
	writeRoleIds: string[];
	/** True when the deployment loads its namespace config from a metadata directory — the update call refuses with 409. */
	readOnlyConfig: boolean;
};

export type UpdateMcpAccessBody = {
	readRoleIds: string[];
	writeRoleIds: string[];
};

export type GetMcpAccessResult = { success: true; data: McpAccessConfig } | { success: false; errors: AdminError[] };
export type UpdateMcpAccessResult = { success: true; data: UpdateMcpAccessBody } | { success: false; errors: AdminError[] };

const base = (opts: AdminMcpAccessClientOptions) => ({
	headers: { Authorization: opts.accessKey ?? '' },
	url: opts.endpoint,
});

/**
 * GET /api/admin/mcp-access — the roles allowed to reach the MCP, split into
 * read and write. Requires an admin session (never a PAT).
 */
export async function getMcpAccess(opts: AdminMcpAccessClientOptions): Promise<GetMcpAccessResult> {
	const { url, headers } = base(opts);
	return request<GetMcpAccessResult>(`${url}/api/admin/mcp-access`, { method: 'GET', headers });
}

/**
 * PUT /api/admin/mcp-access — replaces both role lists. Requires an admin
 * session (never a PAT).
 *
 * Both lists are replaced wholesale: whatever is omitted loses access. An
 * unknown role id is rejected with 400 and nothing is written; a deployment
 * whose config comes from a metadata directory answers 409
 * (`mcp-access-config-read-only`).
 */
export async function updateMcpAccess(opts: AdminMcpAccessClientOptions, body: UpdateMcpAccessBody): Promise<UpdateMcpAccessResult> {
	const { url, headers } = base(opts);
	return request<UpdateMcpAccessResult>(`${url}/api/admin/mcp-access`, {
		method: 'PUT',
		headers: { ...headers, 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});
}
