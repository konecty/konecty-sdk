/**
 * Código devolvido pelo Konecty quando a requisição pede ordenação arbitrária
 * acima do teto de página. Acima de `MAX_SORTED_PAGE_SIZE` registros — e no caso
 * sem limite (`limit: -1`) — o `$sort` teria de terminar antes de o primeiro
 * documento sair do cursor, então a API recusa em vez de trocar a ordenação em
 * silêncio, como fazia antes.
 *
 * Espelha `SORT_ABOVE_MAX_PAGE_SIZE` no SDK Python — manter os dois em sincronia.
 */
export const SORT_ABOVE_MAX_PAGE_SIZE = 'SORT_ABOVE_MAX_PAGE_SIZE';

/** Teto do servidor. Informativo: quem decide é a API, este valor só evita adivinhação. */
export const MAX_SORTED_PAGE_SIZE = 1000;

export type KonectyErrorItem = { message: string; code?: string };

/**
 * Lançado quando a ordenação pedida excede o teto. Carrega o `code` para o
 * chamador poder ramificar sem inspecionar a mensagem — mesmo contrato do
 * `KonectyGoogleSessionError`. Como estende `Error`, quem só lê `.message`
 * continua funcionando.
 *
 * A saída é ordenar por `_id` (ascendente ou descendente) e paginar por faixa de
 * `_id`, ou pedir no máximo `MAX_SORTED_PAGE_SIZE` registros.
 *
 * Espelha `KonectySortLimitError` no SDK Python — manter os dois em sincronia.
 */
export class KonectySortLimitError extends Error {
	code: typeof SORT_ABOVE_MAX_PAGE_SIZE;

	constructor(message?: string) {
		super(message ?? 'Sorting above the maximum sorted page size is not supported');
		this.name = 'KonectySortLimitError';
		this.code = SORT_ABOVE_MAX_PAGE_SIZE;
	}
}

function parseErrorItems(raw: string): KonectyErrorItem[] | null {
	try {
		const body = JSON.parse(raw) as { errors?: KonectyErrorItem[] };
		const errors = body?.errors;
		return Array.isArray(errors) && errors.length > 0 ? errors : null;
	} catch {
		return null;
	}
}

/**
 * Traduz um corpo de resposta com falha no formato de erro do SDK, preservando o
 * `code`.
 *
 * Existe porque os caminhos de find e stream descartavam o corpo e reportavam
 * `${status} - ${statusText}`: quem levava um 400 por causa do sort via só
 * "400 - Bad Request", sem o código e sem a instrução de como corrigir a chamada.
 */
export function errorItemsFromResponseBody(status: number, statusText: string, raw: string): KonectyErrorItem[] {
	const items = parseErrorItems(raw);

	// Só os erros que trazem `code` passam a vir do corpo. Para todo o resto o
	// formato antigo (`${status} - ${statusText}`) é mantido de propósito: trocar a
	// mensagem de TODOS os erros seria mudança de contrato bem além do que este
	// código de erro exige, e há consumidor (e teste) que casa com o status.
	if (items?.some(error => error?.code != null) === true) {
		return items;
	}

	return [{ message: `${status} - ${statusText}` }];
}

/**
 * Converte a lista de erros da API na exceção mais específica que der. É o que os
 * métodos de `Module` lançam, no lugar de um `Error` genérico.
 */
export function konectyErrorFromErrors(errors: string[] | KonectyErrorItem[] | undefined): Error {
	const items: KonectyErrorItem[] = (errors ?? [{ message: 'Unknown error' }]).map(error =>
		typeof error === 'string' ? { message: error } : error,
	);

	const sortError = items.find(error => error?.code === SORT_ABOVE_MAX_PAGE_SIZE);
	if (sortError != null) {
		return new KonectySortLimitError(sortError.message);
	}

	return new Error(items.map(error => error?.message).filter(Boolean).join('\n'));
}
