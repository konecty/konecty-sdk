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
 * Recusa de forma ou de faixa do valor do operador: `lat`/`lng` (ou `record`)
 * ou `radius` ausente, as duas formas juntas, chave desconhecida, coordenada
 * fora da faixa, string numérica no lugar de número, raio não positivo ou acima
 * do teto do servidor.
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
 * A cadeia de centros por referência passou do teto de profundidade do servidor.
 *
 * Acontece quando um centro aponta para um registro cujo filtro de leitura tem,
 * ele próprio, um `within_radius` com centro por referência — a resolução é
 * recursiva, e o servidor corta. Não é erro do valor enviado: é a configuração
 * de metadado do documento alvo. Quem opera o tenant resolve; quem chama a API,
 * não.
 *
 * Espelha `WITHIN_RADIUS_CENTER_DEPTH_EXCEEDED` no SDK Python — manter os dois em sincronia.
 */
export const WITHIN_RADIUS_CENTER_DEPTH_EXCEEDED = 'WITHIN_RADIUS_CENTER_DEPTH_EXCEEDED';

/**
 * A requisição pediu mais centros por referência do que o servidor resolve de
 * uma vez. Cada centro distinto é uma leitura; o teto existe para que um filtro
 * não vire N requisições internas.
 *
 * O SDK **não** duplica o teto — quem decide é o servidor, e um número copiado
 * aqui passaria a mentir assim que o backend mudasse. Mesma postura do
 * `SORT_ABOVE_MAX_PAGE_SIZE`. A saída é dividir a busca em requisições menores,
 * ou repetir o mesmo centro (centros idênticos contam uma vez só).
 *
 * Espelha `WITHIN_RADIUS_TOO_MANY_CENTERS` no SDK Python — manter os dois em sincronia.
 */
export const WITHIN_RADIUS_TOO_MANY_CENTERS = 'WITHIN_RADIUS_TOO_MANY_CENTERS';

/**
 * Campo calculado que o servidor acrescenta a cada registro devolvido por `find`
 * quando o filtro tem **um** centro de distância: a única condição
 * `within_radius` habilitada no caminho AND do filtro da requisição. Valor em
 * **metros**, inteiro. Com zero ou duas+ condições nessa posição, ou quando o
 * usuário não pode ler o campo `address` do centro, o campo simplesmente não
 * vem — não é erro.
 *
 * É também o `property` de ordenação por distância:
 * `sort: [{ property: DISTANCE_FIELD, direction: 'ASC' }]`.
 *
 * Nunca é gravado: devolver o registro inteiro num `update` com `_distance`
 * dentro é recusado pelo servidor como campo inexistente.
 *
 * Espelha `DISTANCE_FIELD` em `KonectySdkPython.lib.filters` — manter os dois em sincronia.
 */
export const DISTANCE_FIELD = '_distance';

/**
 * Recusa de ordenação por `_distance`: o filtro não tem exatamente um
 * `within_radius` no caminho AND, ou o usuário não pode ler (ou só lê sob
 * condição) o campo `address` do centro. O servidor responde HTTP 400; a
 * mensagem diz qual dos dois casos é.
 *
 * Espelha `DISTANCE_SORT_UNAVAILABLE` no SDK Python — manter os dois em sincronia.
 */
export const DISTANCE_SORT_UNAVAILABLE = 'DISTANCE_SORT_UNAVAILABLE';

/**
 * Centro tomado de outro registro, em vez de coordenadas literais: "perto do
 * empreendimento X". O servidor lê o registro sob controle de acesso completo e
 * substitui pelas coordenadas antes de compilar a query.
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

/**
 * Centro literal, com as coordenadas **nomeadas**. Porto Alegre, por exemplo, é
 * `{ lat: -30.0346, lng: -51.2177 }`. O nome das chaves existe para acabar com o
 * erro de inverter a ordem de um par: a tradução para `[lng, lat]` é do servidor.
 */
export type WithinRadiusLiteralValue = {
	/** Latitude, em `[-90, 90]`. */
	lat: number;
	/** Longitude, em `[-180, 180]`. */
	lng: number;
	/** Raio em **metros**. */
	radius: number;
	record?: never;
};

/** Centro por referência a outro registro. */
export type WithinRadiusRecordValue = {
	record: WithinRadiusCenterRef;
	/** Raio em **metros**. */
	radius: number;
	lat?: never;
	lng?: never;
};

/**
 * Valor da condição `within_radius`: `{ lat, lng, radius }` **ou**
 * `{ record, radius }` — exatamente uma das duas formas. O servidor recusa as
 * duas juntas e qualquer chave desconhecida (inclusive a forma antiga
 * `center`) com `WITHIN_RADIUS_INVALID_VALUE`, nomeando a chave.
 *
 * O SDK **não** valida faixa nem teto: quem decide é o servidor, e um teto
 * copiado aqui passa a mentir assim que o backend mudar. O contrato vigente é
 * `lat` em `[-90, 90]`, `lng` em `[-180, 180]`, números finitos, e raio em
 * **metros**, positivo, com teto de meia circunferência da Terra.
 */
export type WithinRadiusValue = WithinRadiusLiteralValue | WithinRadiusRecordValue;

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
	code: string;

	constructor(message?: string, code: string = WITHIN_RADIUS_CENTER_UNRESOLVED) {
		super(message ?? `Could not resolve the center record for operator ${WITHIN_RADIUS}`);
		this.name = 'KonectyWithinRadiusCenterError';
		this.code = code;
	}
}

/**
 * A cadeia de centros por referência passou do teto de profundidade do servidor.
 *
 * **Herda de `KonectyWithinRadiusCenterError` de propósito:** é uma falha de
 * resolução de centro, e a própria mensagem do servidor começa com "Could not
 * resolve the center record". Quem escreveu `catch (KonectyWithinRadiusCenterError)`
 * antes deste código existir continua pegando — que é o mesmo compromisso que o
 * `SORT_ABOVE_MAX_PAGE_SIZE` assumiu ao subclassar `KonectyAPIError`.
 *
 * Espelha `KonectyWithinRadiusCenterDepthError` no SDK Python — manter os dois em sincronia.
 */
export class KonectyWithinRadiusCenterDepthError extends KonectyWithinRadiusCenterError {
	constructor(message?: string) {
		super(message ?? `Center hydration exceeded the maximum depth for operator ${WITHIN_RADIUS}`, WITHIN_RADIUS_CENTER_DEPTH_EXCEEDED);
		this.name = 'KonectyWithinRadiusCenterDepthError';
	}
}

/**
 * A requisição pediu mais centros por referência do que o servidor resolve de
 * uma vez.
 *
 * **NÃO** herda de `KonectyWithinRadiusCenterError`: nenhum centro específico
 * falhou — a requisição inteira foi recusada antes de qualquer leitura. Tratar
 * cota como falha de centro levaria o chamador a procurar um registro culpado
 * que não existe.
 *
 * Espelha `KonectyWithinRadiusTooManyCentersError` no SDK Python — manter os dois em sincronia.
 */
export class KonectyWithinRadiusTooManyCentersError extends Error {
	code: typeof WITHIN_RADIUS_TOO_MANY_CENTERS;

	constructor(message?: string) {
		super(message ?? `Too many center records requested for operator ${WITHIN_RADIUS}`);
		this.name = 'KonectyWithinRadiusTooManyCentersError';
		this.code = WITHIN_RADIUS_TOO_MANY_CENTERS;
	}
}

/**
 * Lançado quando o servidor recusa uma ordenação por `_distance`.
 *
 * **NÃO** herda de `KonectySortLimitError`: não é teto de página, e a saída não
 * é ordenar por `_id` — é acertar o filtro (um `within_radius` só, no caminho
 * AND) ou a permissão de leitura do campo `address`.
 *
 * Espelha `KonectyDistanceSortUnavailableError` no SDK Python — manter os dois em sincronia.
 */
export class KonectyDistanceSortUnavailableError extends Error {
	code: typeof DISTANCE_SORT_UNAVAILABLE;

	constructor(message?: string) {
		super(message ?? `Sorting by ${DISTANCE_FIELD} is not available for this query`);
		this.name = 'KonectyDistanceSortUnavailableError';
		this.code = DISTANCE_SORT_UNAVAILABLE;
	}
}

/**
 * Monta a condição de filtro do operador.
 *
 * ```ts
 * withinRadiusCondition('address', { lat: -30.0346, lng: -51.2177, radius: 5000 });
 * // { term: 'address', operator: 'within_radius', value: { lat: -30.0346, lng: -51.2177, radius: 5000 } }
 * ```
 *
 * O valor vai como o chamador o escreveu, sem remontar: uma chave a mais (a
 * forma antiga `center`, as duas formas juntas, vindas de JS sem tipo) chega ao
 * servidor, que a recusa NOMEANDO a chave. Descartá-la aqui trocaria essa
 * mensagem por um "falta `lat`" que o chamador não entenderia.
 *
 * Espelha `within_radius_condition` no SDK Python — a mesma entrada produz a
 * mesma saída (travado por teste: `src/__test__/api/withinRadius.test.ts` e
 * `tests/test_within_radius.py`).
 */
export function withinRadiusCondition(term: string, value: WithinRadiusValue): KonCondition {
	return {
		term,
		operator: WITHIN_RADIUS,
		value: { ...value },
	};
}
