import type { KonCondition } from '@konecty/sdk/types/filter';

/**
 * Operador de filtro de busca por raio geográfico, aceito pelo Konecty em campos
 * de tipo `address`. O par de coordenadas mora em `address.geolocation`, e o
 * sufixo é acrescentado pelo SERVIDOR — o `term` é o campo `address` puro.
 *
 * Espelha `WITHIN_RADIUS` em `KonectySdkPython.lib.filters` — manter os dois em
 * sincronia.
 */
export const WITHIN_RADIUS = 'within_radius';

/**
 * Recusa de forma ou de faixa do valor do operador: `center` ou `radius`
 * ausente, coordenada fora da faixa, string numérica no lugar de número, raio
 * não positivo ou acima do teto do servidor.
 *
 * Espelha `WITHIN_RADIUS_INVALID_VALUE` no SDK Python — manter os dois em sincronia.
 */
export const WITHIN_RADIUS_INVALID_VALUE = 'WITHIN_RADIUS_INVALID_VALUE';

/**
 * O centro por referência a registro não pôde ser resolvido. Um código só para
 * os três casos (registro inexistente, ilegível, ou sem geolocalização) é
 * decisão do servidor: distinguí-los na resposta transformaria o filtro num
 * oráculo de localização para quem não pode ler o registro.
 *
 * Espelha `WITHIN_RADIUS_CENTER_UNRESOLVED` no SDK Python — manter os dois em sincronia.
 */
export const WITHIN_RADIUS_CENTER_UNRESOLVED = 'WITHIN_RADIUS_CENTER_UNRESOLVED';

/**
 * Par de coordenadas do centro, na ordem **`[longitude, latitude]`**.
 *
 * Longitude PRIMEIRO. É a ordem do par já gravado em `address.geolocation` e a
 * que o Mongo consome, e é o erro nº 1 que se comete aqui — por isso o tipo é
 * uma tupla nomeada, e não `number[]`: inverter os dois passa a ser visível no
 * editor, não só em produção.
 *
 * Porto Alegre, por exemplo, é `[-51.2177, -30.0346]` — longitude ~ -51, latitude ~ -30.
 */
export type WithinRadiusCoordinatePair = [longitude: number, latitude: number];

/**
 * Centro tomado de outro registro, em vez de um par literal: "perto do
 * empreendimento X". O servidor lê o registro sob controle de acesso completo e
 * substitui pelo par antes de compilar a query.
 *
 * `field` é obrigatório porque um documento pode ter mais de um campo `address`
 * e adivinhar seria escolher em silêncio.
 */
export type WithinRadiusCenterRef = {
	/** Nome do documento do registro-centro (ex.: `'Development'`). */
	document: string;
	/** `_id` do registro-centro. */
	_id: string;
	/** Campo de tipo `address` do registro-centro de onde tirar a coordenada. */
	field: string;
};

export type WithinRadiusCenter = WithinRadiusCoordinatePair | WithinRadiusCenterRef;

/**
 * Valor da condição `within_radius`.
 *
 * O SDK **não** valida faixa nem teto: quem decide é o servidor, e um teto
 * copiado aqui passa a mentir assim que o backend mudar. O contrato vigente é
 * raio em **metros**, número finito positivo, com teto de meia circunferência
 * da Terra; passar disso volta como `WITHIN_RADIUS_INVALID_VALUE`.
 */
export type WithinRadiusValue = {
	/** `[longitude, latitude]` — nesta ordem — ou a referência a outro registro. */
	center: WithinRadiusCenter;
	/** Raio em **metros**. */
	radius: number;
};

/**
 * Lançado quando o servidor recusa a forma ou a faixa do valor de um
 * `within_radius`. Carrega o `code` para o chamador ramificar sem inspecionar a
 * mensagem, e preserva a mensagem do servidor — que nomeia o termo e a chave
 * exata que falhou.
 *
 * Espelha `KonectyWithinRadiusValueError` no SDK Python — manter os dois em sincronia.
 */
export class KonectyWithinRadiusValueError extends Error {
	code: typeof WITHIN_RADIUS_INVALID_VALUE;

	constructor(message?: string) {
		super(message ?? `Invalid value for operator ${WITHIN_RADIUS}`);
		this.name = 'KonectyWithinRadiusValueError';
		this.code = WITHIN_RADIUS_INVALID_VALUE;
	}
}

/**
 * Lançado quando o centro por referência a registro não pôde ser resolvido.
 *
 * Espelha `KonectyWithinRadiusCenterError` no SDK Python — manter os dois em sincronia.
 */
export class KonectyWithinRadiusCenterError extends Error {
	code: typeof WITHIN_RADIUS_CENTER_UNRESOLVED;

	constructor(message?: string) {
		super(message ?? `Could not resolve the center record for operator ${WITHIN_RADIUS}`);
		this.name = 'KonectyWithinRadiusCenterError';
		this.code = WITHIN_RADIUS_CENTER_UNRESOLVED;
	}
}

/**
 * Monta a condição de filtro do operador.
 *
 * Existe para que a ordem `[longitude, latitude]` e o raio em metros apareçam
 * uma vez, tipados, em vez de serem redigitados como objeto literal em cada
 * chamada — que é onde a inversão das coordenadas entra.
 *
 * ```ts
 * withinRadiusCondition('address', { center: [-51.2177, -30.0346], radius: 5000 });
 * // { term: 'address', operator: 'within_radius', value: { center: [-51.2177, -30.0346], radius: 5000 } }
 * ```
 *
 * Espelha `within_radius_condition` no SDK Python — a mesma entrada produz a
 * mesma saída (travado por teste: `src/__test__/api/withinRadius.test.ts` e
 * `tests/test_within_radius.py`).
 */
export function withinRadiusCondition(term: string, value: WithinRadiusValue): KonCondition {
	return {
		term,
		operator: WITHIN_RADIUS,
		value: { center: value.center, radius: value.radius },
	};
}
