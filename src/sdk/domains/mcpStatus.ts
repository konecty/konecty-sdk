import type { SharedError } from './patShared';
import { request } from './patShared';

export type McpStatusClientOptions = {
	endpoint: string;
	accessKey?: string;
};

export type McpStatusError = SharedError;

/** `write` implies read. `none` when the namespace grants the caller's role no MCP access. */
export type McpAccessLevel = 'none' | 'read' | 'write';

/** Derived by the backend from the host of the OAuth client's redirect URI. */
export type McpAgent = 'claude' | 'chatgpt' | 'other';

/**
 * One active OAuth grant of the caller. Never carries the client id, redirect
 * URIs or any token data — the backend builds it from an allowlist.
 */
export type McpConnection = {
	id: string;
	clientName: string | null;
	agent: McpAgent;
	scopes: string[];
	resource: string;
	connectedAt: string;
	/** Most recent token issued for the grant (accurate to ~1 hour); `null` when none was. */
	lastActiveAt: string | null;
	/** Present only while an `admin` scope is effective and time-bounded. */
	adminExpiresAt?: string;
};

export type McpStatus = { access: McpAccessLevel; connections: McpConnection[] };

export type GetMcpStatusResult = { success: true; data: McpStatus } | { success: false; errors: McpStatusError[] };
export type RevokeMcpConnectionResult = { success: true } | { success: false; errors: McpStatusError[] };

/** Stable `errors[].code` for a caller that is not a first-party session (PAT or OAuth token). */
export const MCP_STATUS_REQUIRES_SESSION_CODE = 'mcp-status-requires-session';

const base = (opts: McpStatusClientOptions) => ({
	headers: { Authorization: opts.accessKey ?? '' },
	url: opts.endpoint,
});

/**
 * GET /rest/auth/mcp/status — the caller's MCP access level and the agents
 * connected to their account through OAuth. Requires a first-party session.
 * Never throws on a 4xx/5xx: branch on `result.success`.
 */
export async function getMcpStatus(opts: McpStatusClientOptions): Promise<GetMcpStatusResult> {
	const { url, headers } = base(opts);
	return request<GetMcpStatusResult>(`${url}/rest/auth/mcp/status`, { method: 'GET', headers });
}

/**
 * DELETE /rest/auth/mcp/connections/:id — disconnects one of the caller's
 * agents (revokes the grant and its tokens). Self-scoped: an unknown, foreign
 * or already-revoked id answers the same 404.
 */
export async function revokeMcpConnection(opts: McpStatusClientOptions, id: string): Promise<RevokeMcpConnectionResult> {
	const { url, headers } = base(opts);
	return request<RevokeMcpConnectionResult>(`${url}/rest/auth/mcp/connections/${encodeURIComponent(id)}`, { method: 'DELETE', headers });
}
