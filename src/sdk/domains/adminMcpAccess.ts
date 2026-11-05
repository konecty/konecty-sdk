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
	/**
	 * `true` for a role registered in `Role`. `false` for a role that is not
	 * there but is carried by an active user (`user.role` / `user.roles[]`) or
	 * already sits in one of the lists — it takes its `name` from the users that
	 * carry it, and has no `name` when only the lists reference it. Absent on
	 * servers older than this field.
	 */
	registered?: boolean;
};

export type McpAccessActiveUsersByRoleSet = {
	/** One distinct combination of roles carried by active users. */
	roleIds: string[];
	/** How many active users carry exactly that combination — a count, never who they are. */
	count: number;
};

export type McpAccessConfig = {
	/**
	 * Every role a picker needs from one call: the roles registered in `Role`
	 * (`registered: true`), plus the roles active users carry and the ids already
	 * in the lists, even when they are not registered (`registered: false`).
	 * Roles carried only by inactive users are left out.
	 */
	roles: McpAccessRole[];
	/** Roles allowed to reach the MCP. A role in `writeRoleIds` also reads, whether or not it is listed here. */
	readRoleIds: string[];
	/** Roles allowed to use write/destructive MCP tools. */
	writeRoleIds: string[];
	/**
	 * Active users per distinct combination of roles, so a caller can tell before
	 * saving how many active users would lose MCP access (or only write access)
	 * without counting twice a user with two roles. Absent on servers older than
	 * this field.
	 */
	activeUsersByRoleSet?: McpAccessActiveUsersByRoleSet[];
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
 * Both lists are replaced wholesale: whatever is omitted loses access. Any id
 * `getMcpAccess` lists in `roles` is accepted — registered, carried by an
 * active user, or already in the lists. Only an id none of those sources know
 * is rejected, with 400 `Unknown role: <id>`, and nothing is written; a
 * deployment whose config comes from a metadata directory answers 409
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
