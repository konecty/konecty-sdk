import type { SharedError } from './patShared';
import { request } from './patShared';

/**
 * Administração de metadados por HTTP (`/api/admin/meta`).
 *
 * Fatia mínima da superfície: listar, ler, gravar, remover, histórico e rollback. As demais rotas
 * do core (hooks, doctor, reload, leitura por tipo) existem e são documentadas em
 * `docs/features.json`, mas não têm consumidor conhecido de SDK — YAGNI até que tenham.
 *
 * **Exige sessão first-party de admin.** PAT e token OAuth são recusados com `403` e o código
 * estável `admin-credential-routes-require-session`: metadado decide quem lê e escreve o quê, então
 * uma credencial delegada não o altera.
 */

export type AdminMetaClientOptions = {
	endpoint: string;
	accessKey?: string;
};

export type AdminError = SharedError;

/** `409` — o deployment carrega metadados de um diretório (`METADATA_DIR`); nada é gravável. */
export const META_ADMIN_CONFIG_READ_ONLY_CODE = 'meta-admin-config-read-only';

/** `403` — a rota exige sessão first-party; PAT e token OAuth são recusados. */
export const ADMIN_ROUTES_REQUIRE_SESSION_CODE = 'admin-credential-routes-require-session';

export type MetaDocumentSummary = {
	_id: string;
	name?: string;
	type?: string;
	label?: unknown;
};

export type MetaHistoryOperation = 'create' | 'update' | 'delete' | 'rollback';

export type MetaHistoryEntry = {
	metaId: string;
	version: number;
	/** Estado **após** a escrita: vale o invariante "estado atual == snapshot da última versão". */
	snapshot: Record<string, unknown> | null;
	operation: MetaHistoryOperation;
	changedBy: string;
	changedAt: string;
	/** Superfície que escreveu: `rest:meta`, `meta_document_upsert`, … */
	via: string;
};

export type UpsertMetaResult = {
	matchedCount: number;
	modifiedCount: number;
	upsertedCount: number;
	/** `false` quando o conteúdo era idêntico ao atual — nenhuma versão criada. */
	versioned: boolean;
	version: number;
};

export type DeleteMetaResult = {
	deletedCount: number;
	version: number;
};

export type RollbackResult = {
	version: number;
	/** A versão cujo conteúdo foi restaurado. O rollback é forward-only: cria versão nova. */
	restoredFrom: number;
};

export type ListHistoryOptions = {
	limit?: number;
	offset?: number;
};

type Envelope<T> = { success: true; data: T } | { success: false; errors: AdminError[] };

export type ListMetaDocumentsResult = Envelope<MetaDocumentSummary[]>;
export type ReadMetaResult = Envelope<Record<string, unknown>>;
export type UpsertMetaCallResult = Envelope<UpsertMetaResult>;
export type DeleteMetaCallResult = Envelope<DeleteMetaResult>;
export type ListMetaHistoryResult = Envelope<MetaHistoryEntry[]>;
export type RollbackMetaResult = Envelope<RollbackResult>;

const base = (opts: AdminMetaClientOptions) => ({
	headers: { Authorization: opts.accessKey ?? '' },
	url: opts.endpoint,
});

const jsonHeaders = (opts: AdminMetaClientOptions) => ({ ...base(opts).headers, 'Content-Type': 'application/json' });

/**
 * Codifica UM segmento de path, deixando `:` cru.
 *
 * Por segmento e não no caminho inteiro: um `_id` de meta carrega `:` (`Product:list:Default`), e
 * codificar o path todo escaparia as barras que o separam.
 *
 * **Sub-delims e `:@` ficam crus de propósito.** `encodeURIComponent` os escaparia (`%3A`, `%24`,
 * …), mas o `yarl` do aiohttp — sob o SDK Python — normaliza essas sequências de volta ao caractere
 * ao montar a requisição, porque todas são `pchar` legal em segmento de path (RFC 3986). Escapá-las
 * aqui faria os dois SDKs colocarem **bytes diferentes na rede** para o mesmo `_id`, que é
 * exatamente a classe de divergência que o AGENTS.md manda travar por teste.
 *
 * Medido caractere a caractere contra o `yarl`, não suposto — e travado no teste de paridade, que
 * compara esta saída com o `raw_path` que o stub do Python recebe.
 *
 * Todo o resto segue codificado: `/` vira `%2F` (senão o segmento quebraria o path) e espaço vira
 * `%20` nos dois lados, nunca `+`.
 */
const PATH_SAFE_ESCAPES = /%(3A|24|26|2C|3B|3D|40)/g;

// `+` fica FORA da lista de propósito: o `yarl` mantém `%2B` codificado, e está certo — um `+` cru
// num path pode ser lido como espaço por servidor leniente. Alinhado ao lado seguro, que também é o
// que o Python faz. Medido: era a única divergência restante entre os dois após alinhar os demais.
const PATH_SAFE_CHARS: Record<string, string> = { '3A': ':', '24': '$', '26': '&', '2C': ',', '3B': ';', '3D': '=', '40': '@' };

const segment = (value: string): string => encodeURIComponent(value).replace(PATH_SAFE_ESCAPES, (_match, hex: string) => PATH_SAFE_CHARS[hex]);

/** GET /api/admin/meta — os documentos de metadado do namespace. */
export async function listMetaDocuments(opts: AdminMetaClientOptions): Promise<ListMetaDocumentsResult> {
	const { url, headers } = base(opts);
	return request<ListMetaDocumentsResult>(`${url}/api/admin/meta`, { method: 'GET', headers });
}

/** GET /api/admin/meta/:document — o metadado de um documento. `404` quando não existe. */
export async function readMeta(opts: AdminMetaClientOptions, document: string): Promise<ReadMetaResult> {
	const { url, headers } = base(opts);
	return request<ReadMetaResult>(`${url}/api/admin/meta/${segment(document)}`, { method: 'GET', headers });
}

/**
 * PUT /api/admin/meta/:document/:type — grava o metadado singleton de um tipo
 * (`document`, `composite`, `namespace`).
 *
 * Escrita idêntica ao estado atual **não** cria versão (`versioned: false`).
 */
export async function upsertMeta(opts: AdminMetaClientOptions, document: string, type: string, body: Record<string, unknown>): Promise<UpsertMetaCallResult> {
	const { url } = base(opts);
	return request<UpsertMetaCallResult>(`${url}/api/admin/meta/${segment(document)}/${segment(type)}`, {
		method: 'PUT',
		headers: jsonHeaders(opts),
		body: JSON.stringify(body),
	});
}

/** DELETE /api/admin/meta/:document/:type — remove e versiona a remoção. O Namespace não é deletável. */
export async function deleteMeta(opts: AdminMetaClientOptions, document: string, type: string): Promise<DeleteMetaCallResult> {
	const { url, headers } = base(opts);
	return request<DeleteMetaCallResult>(`${url}/api/admin/meta/${segment(document)}/${segment(type)}`, { method: 'DELETE', headers });
}

/** GET /api/admin/meta/:metaId/history — versões, mais recentes primeiro. Meta sem histórico devolve lista vazia. */
export async function listMetaHistory(opts: AdminMetaClientOptions, metaId: string, options: ListHistoryOptions = {}): Promise<ListMetaHistoryResult> {
	const { url, headers } = base(opts);
	const query = new URLSearchParams();
	if (options.limit != null) {
		query.set('limit', String(options.limit));
	}
	if (options.offset != null) {
		query.set('offset', String(options.offset));
	}
	const suffix = query.toString().length > 0 ? `?${query.toString()}` : '';

	return request<ListMetaHistoryResult>(`${url}/api/admin/meta/${segment(metaId)}/history${suffix}`, { method: 'GET', headers });
}

/**
 * POST /api/admin/meta/:metaId/rollback — restaura o conteúdo de uma versão anterior.
 *
 * Forward-only: grava uma **versão nova** com o conteúdo da alvo e nunca reescreve nem apaga versão.
 */
export async function rollbackMeta(opts: AdminMetaClientOptions, metaId: string, version: number): Promise<RollbackMetaResult> {
	const { url } = base(opts);
	return request<RollbackMetaResult>(`${url}/api/admin/meta/${segment(metaId)}/rollback`, {
		method: 'POST',
		headers: jsonHeaders(opts),
		body: JSON.stringify({ version }),
	});
}
