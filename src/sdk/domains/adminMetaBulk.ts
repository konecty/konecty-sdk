import fetch from 'isomorphic-fetch';

import logger from '../../lib/logger';

/**
 * Lote de metadados por HTTP (`POST /api/document`, MBD-06..08 no core).
 *
 * Aplica `items` numa transação. Aceita sessão ou PAT de admin, ou PAT de service account criada com
 * `capabilities: ['metaApply']`, que escreve metadado sem acesso a dados.
 *
 * A resposta de sucesso **não** tem envelope `{success, data}`: o corpo é o resultado do lote. Os
 * erros chegam em quatro formas e todas viram `errors: [{message, code?}]`, com `status`:
 * `{errors: [...]}`, o corpo do Fastify no 413, `{error: '...'}` e texto puro (`Forbidden`).
 *
 * Paridade: `apply_meta_bulk` no SDK Python, mesma tabela de casos em `tests/test_meta_bulk.py`.
 */

export type AdminMetaBulkClientOptions = {
	endpoint: string;
	accessKey?: string;
};

export type HookMode = 'preserve' | 'replace';

export type HookFieldName = 'scriptBeforeValidation' | 'validationScript' | 'scriptAfterSave' | 'validationData';

export type ApplyMetaBulkOptions = {
	/** Remove do banco todo metadado que não está em `items`. O servidor recusa junto com `dryRun` ou `namespacePatch`. */
	deleteRemoved?: boolean;
	/** Devolve `plan` e não grava nada. */
	dryRun?: boolean;
	/** `'preserve'` (padrão do servidor) mantém o hook que o item omite; `'replace'` o remove. */
	hookMode?: HookMode;
	/** Chaves de topo gravadas no `Namespace` na mesma transação, por exemplo a versão aplicada. */
	namespacePatch?: Record<string, unknown>;
};

export type ApplyMetaBulkPlan = {
	created: string[];
	updated: { _id: string; keys: string[] }[];
	unchanged: number;
	/** Por `_id`, os hooks gravados que o lote removeria. Só entradas não vazias. */
	hooksRemoved: Record<string, HookFieldName[]>;
	/**
	 * Só quando o `dryRun` recebe `namespacePatch`: as chaves do patch cujo valor difere do Namespace
	 * gravado, em ordem. `[]` quer dizer que o patch não muda nada. Um PAT não lê o Namespace; é assim
	 * que ele sabe se a escrita do Namespace é necessária.
	 */
	namespace?: { keys: string[] };
};

export type ApplyMetaBulkData = {
	applied: number;
	created: number;
	updated: number;
	deleted: number;
	warnings: string[];
	/** Por `_id`, os hooks que o item omitiu e vieram do banco. Só entradas não vazias. */
	preservedHooks: Record<string, HookFieldName[]>;
	/** Só na resposta de um `dryRun`. */
	plan?: ApplyMetaBulkPlan;
};

export type MetaBulkError = { message: string; code?: string } & Record<string, unknown>;

export type ApplyMetaBulkResult =
	| { success: true; data: ApplyMetaBulkData }
	/** `status` é `0` quando a requisição nem chegou a ter resposta (erro de rede). */
	| { success: false; status: number; errors: MetaBulkError[] };

/**
 * Normaliza o corpo de erro numa lista `[{message, code?}]`.
 *
 * A ordem é a mesma de `_meta_bulk_errors` no SDK Python: `errors` primeiro, depois `message` (o 413
 * do Fastify traz `error` **e** `message`, e o útil é o `message` com o `code`), depois `error`, depois
 * o texto cru, e por fim o status.
 */
export function toBulkErrors(status: number, text: string): MetaBulkError[] {
	let body: unknown = null;
	try {
		body = text ? JSON.parse(text) : null;
	} catch {
		body = null;
	}

	if (body != null && typeof body === 'object' && !Array.isArray(body)) {
		const record = body as Record<string, unknown>;
		if (Array.isArray(record.errors) && record.errors.length > 0) {
			return record.errors as MetaBulkError[];
		}
		if (typeof record.message === 'string' && record.message !== '') {
			return [{ message: record.message, ...(typeof record.code === 'string' && { code: record.code }) }];
		}
		if (typeof record.error === 'string' && record.error !== '') {
			return [{ message: record.error }];
		}
	}

	if (body == null && text.trim() !== '') {
		return [{ message: text.trim() }];
	}
	return [{ message: String(status) }];
}

/** POST /api/document — aplica um lote de metadados numa transação. Nunca lança. */
export async function applyMetaBulk(
	opts: AdminMetaBulkClientOptions,
	items: Record<string, unknown>[],
	options: ApplyMetaBulkOptions = {},
): Promise<ApplyMetaBulkResult> {
	const body = {
		items,
		...(options.deleteRemoved != null && { deleteRemoved: options.deleteRemoved }),
		...(options.dryRun != null && { dryRun: options.dryRun }),
		...(options.hookMode != null && { hookMode: options.hookMode }),
		...(options.namespacePatch != null && { namespacePatch: options.namespacePatch }),
	};

	try {
		const res = await fetch(`${opts.endpoint}/api/document`, {
			method: 'POST',
			headers: { Authorization: opts.accessKey ?? '', 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		});
		const text = await res.text();
		if (res.status >= 400) {
			logger.error(`${res.status} ${res.statusText}`, { url: `${opts.endpoint}/api/document` });
			return { success: false, status: res.status, errors: toBulkErrors(res.status, text) };
		}
		return { success: true, data: JSON.parse(text) as ApplyMetaBulkData };
	} catch (err) {
		logger.error(err);
		return { success: false, status: 0, errors: [{ message: (err as Error).message }] };
	}
}
