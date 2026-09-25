import {
	KonectyClient,
	KonectyWithinRadiusCenterDepthError,
	KonectyWithinRadiusCenterError,
	KonectyWithinRadiusTooManyCentersError,
	KonectyWithinRadiusValueError,
	konectyErrorFromErrors,
	WITHIN_RADIUS,
	WITHIN_RADIUS_CENTER_DEPTH_EXCEEDED,
	WITHIN_RADIUS_CENTER_UNRESOLVED,
	WITHIN_RADIUS_TOO_MANY_CENTERS,
	WITHIN_RADIUS_INVALID_VALUE,
	withinRadiusCondition,
} from '@konecty/sdk/Client';
import type { WithinRadiusCenterRef, WithinRadiusCoordinatePair } from '@konecty/sdk/Client';
import { expect } from 'chai';

import { rest } from 'msw';
import { ProductModule } from '../../__test__/fixtures/types/Product';
import { server } from '../../__test__/setup-test';

/**
 * Operador de filtro `within_radius`.
 *
 * **Paridade com o SDK Python: `tests/test_within_radius.py`** usa a MESMA
 * entrada (mesmo termo, mesmo centro, mesmo raio, mesmos corpos de erro) e
 * espera a MESMA saída. Alterar um destes literais sem alterar o outro arquivo
 * quebra a paridade que esta feature existe para garantir.
 *
 * O contrato é do servidor (`src/imports/data/filters/withinRadius.ts` no repo
 * Konecty): `value: { center: [longitude, latitude] | { document, _id, field }, radius: <metros> }`.
 * O SDK **não** duplica a validação de faixa nem o teto de raio — quem decide é
 * o servidor, e um teto copiado aqui passaria a mentir assim que o backend
 * mudasse. Mesma postura do `SORT_ABOVE_MAX_PAGE_SIZE`.
 *
 * ## Assimetrias com o SDK Python que são ESCOLHA, não defeito
 *
 * 1. **Aridade.** Aqui é `withinRadiusCondition(term, { center, radius })`; no
 *    Python é `within_radius_condition(term, center, radius)`. Mantidas assim de
 *    propósito: cada linguagem segue a convenção do próprio SDK — o TS passa
 *    objeto de opções em todo lugar (`client.find(module, { filter, sort })`), o
 *    Python passa parâmetros nomeados. O que a paridade exige é mesma ENTRADA →
 *    mesma SAÍDA, e isso é o que os literais deste arquivo travam; uniformizar a
 *    forma de chamar tornaria um dos dois estranho na própria linguagem.
 * 2. **Builder.** O Python tem `KonectyFilter.add_within_radius` porque tem uma
 *    classe `KonectyFilter` construída por encadeamento; o TS monta filtro como
 *    objeto literal e **não tem builder nenhum** — inventar um só para este
 *    operador seria superfície pública nova sem caso de uso (YAGNI), e um builder
 *    parcial, que cobre um operador de catorze, é pior que nenhum.
 */

/** O termo é o campo `address` puro: o sufixo `.geolocation` é do servidor, não do cliente. */
const TERM = 'address';

/** Porto Alegre, em `[longitude, latitude]` — longitude ~ -51, latitude ~ -30. */
const CENTER: WithinRadiusCoordinatePair = [-51.2177, -30.0346];
const RADIUS_METERS = 5000;

const CENTER_REF: WithinRadiusCenterRef = { document: 'Development', _id: 'dev-1', field: 'address' };

/** Serialização exata da condição. O SDK Python asseverou a MESMA string. */
const EXPECTED_CONDITION_JSON = '{"term":"address","operator":"within_radius","value":{"center":[-51.2177,-30.0346],"radius":5000}}';

const EXPECTED_CENTER_REF_CONDITION_JSON =
	'{"term":"address","operator":"within_radius","value":{"center":{"document":"Development","_id":"dev-1","field":"address"},"radius":5000}}';

const INVALID_VALUE_MESSAGE =
	'Invalid value for operator within_radius on term "address": center must be an array of exactly 2 numbers, in the order [longitude, latitude]';

/**
 * Id de correlação de exemplo, no formato que o servidor emite: doze caracteres
 * hexadecimais (`randomUUID()` sem hífens, truncado) quando não há tracing
 * ativo, ou o `traceId` de 32 caracteres do span quando há.
 *
 * Ele é o caminho de SUPORTE inteiro do `WITHIN_RADIUS_CENTER_UNRESOLVED`: as
 * causas da falha (registro inexistente, ilegível, ou sem geolocalização) são
 * deliberadamente indistinguíveis na resposta — separá-las daria a quem não pode
 * ler o registro um oráculo de existência e de localização. A causa real fica
 * só no log do servidor, indexada por este id. Um SDK que truncasse a mensagem
 * jogaria fora a única chave que liga o relato do usuário à linha de log.
 */
const CORRELATION_ID = '7b3f2a9c41d8';

/**
 * Mensagem REAL do servidor quando a hidratação do centro por referência falha,
 * copiada de `src/imports/data/filters/hydrateFilterCenters.ts` (função
 * `unresolvedReturn`) no repo Konecty. Termina com o id de correlação.
 */
const CENTER_UNRESOLVED_MESSAGE = `Could not resolve the center record for operator within_radius on term "address". Correlation id: ${CORRELATION_ID}`;

/**
 * A OUTRA mensagem com o mesmo código, do guard de "centro não hidratado" em
 * `src/imports/data/filters/withinRadius.ts` (`compileWithinRadius`): um centro
 * por referência que chega por um caminho que não hidrata (`update`,
 * `findById`) é recusado aqui, com texto próprio sobre caminhos de leitura e
 * **sem** id de correlação. São duas mensagens diferentes sob um código só, e o
 * SDK não pode assumir a forma de nenhuma das duas.
 */
const CENTER_UNRESOLVED_WRITE_PATH_MESSAGE =
	'Could not resolve the center record for operator within_radius on term "address". ' +
	'A center by record reference is resolved only on read paths (find, stream/export and lookup) and is not supported here.';

const ENDPOINT = 'http://localhost:3000';

describe('operador de filtro within_radius', () => {
	const client = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-key' });

	describe('withinRadiusCondition (montagem da condição)', () => {
		it('monta term/operator/value com o centro literal em [longitude, latitude]', () => {
			const condition = withinRadiusCondition(TERM, { center: CENTER, radius: RADIUS_METERS });

			expect(condition.operator).to.equal(WITHIN_RADIUS);
			expect(condition.operator).to.equal('within_radius');
			expect(JSON.stringify(condition)).to.equal(EXPECTED_CONDITION_JSON);
		});

		it('preserva a ORDEM das coordenadas — longitude primeiro, latitude depois', () => {
			// O erro nº 1 deste operador é inverter as duas. O teste fixa a ordem com
			// valores de sinais e magnitudes distinguíveis (-51 lng, -30 lat).
			const condition = withinRadiusCondition(TERM, { center: CENTER, radius: RADIUS_METERS });
			const center = (condition.value as { center: WithinRadiusCoordinatePair }).center;

			expect(center[0]).to.equal(-51.2177);
			expect(center[1]).to.equal(-30.0346);
		});

		it('não coage string numérica — deixa o servidor recusar', () => {
			// Paridade com `test_numeric_strings_are_not_coerced` em
			// `konecty-sdk-python/tests/test_within_radius.py`: mesma entrada, mesma
			// saída. O tipo já barra isto em tempo de compilação, mas um chamador em
			// JS puro passa direto — e o servidor recusa string numérica de propósito
			// (GEO-02). Coagir aqui esconderia o erro do chamador em vez de reportá-lo.
			const condition = withinRadiusCondition(TERM, {
				center: ['-51.2177', '-30.0346'] as unknown as WithinRadiusCoordinatePair,
				radius: RADIUS_METERS,
			});
			const center = (condition.value as { center: unknown }).center;

			expect(center).to.deep.equal(['-51.2177', '-30.0346']);
		});

		it('aceita centro por referência a outro registro', () => {
			const condition = withinRadiusCondition(TERM, { center: CENTER_REF, radius: RADIUS_METERS });

			expect(JSON.stringify(condition)).to.equal(EXPECTED_CENTER_REF_CONDITION_JSON);
		});
	});

	describe('requisição montada (é onde os dois SDKs já divergiram)', () => {
		it('põe a condição na query string exatamente como o servidor a espera', async () => {
			let filterParam: string | null = null;
			let rawSearch = '';

			server.use(
				rest.get(`${ENDPOINT}/rest/data/Product/find`, (req, res, ctx) => {
					filterParam = req.url.searchParams.get('filter');
					rawSearch = req.url.search;
					return res(ctx.status(200), ctx.json({ success: true, data: [], total: 0 }));
				}),
			);

			await client.find('Product', {
				filter: { match: 'and', conditions: [withinRadiusCondition(TERM, { center: CENTER, radius: RADIUS_METERS })] },
			});

			// Decodificado: a condição chega byte a byte como o SDK Python a envia.
			expect(filterParam).to.equal(`{"match":"and","conditions":[${EXPECTED_CONDITION_JSON}]}`);
			// Cru: `URLSearchParams` percent-encoda; nenhum caractere do valor escapa sem codificação.
			expect(rawSearch).to.contain('filter=');
			expect(rawSearch).to.not.contain('{');
			expect(rawSearch).to.not.contain('"');
			expect(rawSearch).to.not.contain(' ');
		});

		it('põe também o centro POR REFERÊNCIA na query string, sem caractere solto', async () => {
			// O centro por referência é um objeto aninhado dentro do valor da condição —
			// mais chaves, mais aspas e um `_id` para escapar que o par literal não tem.
			// Até aqui só o literal passava por uma requisição de verdade, nos dois SDKs.
			let filterParam: string | null = null;
			let rawSearch = '';

			server.use(
				rest.get(`${ENDPOINT}/rest/data/Product/find`, (req, res, ctx) => {
					filterParam = req.url.searchParams.get('filter');
					rawSearch = req.url.search;
					return res(ctx.status(200), ctx.json({ success: true, data: [], total: 0 }));
				}),
			);

			await client.find('Product', {
				filter: { match: 'and', conditions: [withinRadiusCondition(TERM, { center: CENTER_REF, radius: RADIUS_METERS })] },
			});

			expect(filterParam).to.equal(`{"match":"and","conditions":[${EXPECTED_CENTER_REF_CONDITION_JSON}]}`);
			expect(rawSearch).to.contain('filter=');
			expect(rawSearch).to.not.contain('{');
			expect(rawSearch).to.not.contain('"');
			expect(rawSearch).to.not.contain(' ');
		});
	});

	describe('códigos de erro do servidor', () => {
		it('WITHIN_RADIUS_INVALID_VALUE vira KonectyWithinRadiusValueError, não Error genérico', () => {
			const error = konectyErrorFromErrors([{ message: INVALID_VALUE_MESSAGE, code: WITHIN_RADIUS_INVALID_VALUE }]);

			expect(error).to.be.instanceOf(KonectyWithinRadiusValueError);
			expect((error as KonectyWithinRadiusValueError).code).to.equal('WITHIN_RADIUS_INVALID_VALUE');
			// A mensagem do servidor nomeia o termo e a chave que falhou; perdê-la é o pior modo de falha.
			expect(error.message).to.equal(INVALID_VALUE_MESSAGE);
		});

		it('WITHIN_RADIUS_CENTER_UNRESOLVED vira KonectyWithinRadiusCenterError, com o id de correlação intacto', () => {
			const error = konectyErrorFromErrors([{ message: CENTER_UNRESOLVED_MESSAGE, code: WITHIN_RADIUS_CENTER_UNRESOLVED }]);

			expect(error).to.be.instanceOf(KonectyWithinRadiusCenterError);
			expect((error as KonectyWithinRadiusCenterError).code).to.equal('WITHIN_RADIUS_CENTER_UNRESOLVED');
			// A mensagem INTEIRA, id incluído. O id é a única chave que liga o relato do
			// usuário à linha de log com a causa real — truncar a mensagem (ou reescrevê-la
			// com um texto "amigável") apagaria o caminho de suporte deste código de erro.
			expect(error.message).to.equal(CENTER_UNRESOLVED_MESSAGE);
			expect(error.message).to.contain(`Correlation id: ${CORRELATION_ID}`);
		});

		it('preserva também a OUTRA mensagem do mesmo código — a do guard de caminho de escrita', () => {
			// Duas mensagens, um código só. O SDK não conhece a forma de nenhuma das
			// duas: repassa o que veio.
			const error = konectyErrorFromErrors([{ message: CENTER_UNRESOLVED_WRITE_PATH_MESSAGE, code: WITHIN_RADIUS_CENTER_UNRESOLVED }]);

			expect(error).to.be.instanceOf(KonectyWithinRadiusCenterError);
			expect(error.message).to.equal(CENTER_UNRESOLVED_WRITE_PATH_MESSAGE);
		});

		it('as duas continuam sendo Error — quem só lê .message não quebra', () => {
			expect(konectyErrorFromErrors([{ message: INVALID_VALUE_MESSAGE, code: WITHIN_RADIUS_INVALID_VALUE }])).to.be.instanceOf(Error);
			expect(konectyErrorFromErrors([{ message: CENTER_UNRESOLVED_MESSAGE, code: WITHIN_RADIUS_CENTER_UNRESOLVED }])).to.be.instanceOf(Error);
		});

		it('erro sem code conhecido segue Error genérico', () => {
			const error = konectyErrorFromErrors([{ message: 'Some other failure' }]);

			expect(error).to.not.be.instanceOf(KonectyWithinRadiusValueError);
			expect(error).to.not.be.instanceOf(KonectyWithinRadiusCenterError);
			expect(error.message).to.equal('Some other failure');
		});
	});

	describe('Client.find (devolve o resultado, não lança)', () => {
		it('preserva code e mensagem do 400 de valor inválido', async () => {
			server.use(
				rest.get(`${ENDPOINT}/rest/data/Product/find`, (_req, res, ctx) =>
					res(ctx.status(400), ctx.json({ success: false, errors: [{ message: INVALID_VALUE_MESSAGE, code: WITHIN_RADIUS_INVALID_VALUE }] })),
				),
			);

			const result = await client.find('Product', {
				filter: { match: 'and', conditions: [withinRadiusCondition(TERM, { center: CENTER, radius: -1 })] },
			});

			expect(result.success).to.equal(false);
			const first = (result.errors ?? [])[0] as { message: string; code?: string };
			expect(first.code).to.equal(WITHIN_RADIUS_INVALID_VALUE);
			expect(first.message).to.equal(INVALID_VALUE_MESSAGE);
		});

		it('preserva code e mensagem do 400 de centro não resolvido', async () => {
			server.use(
				rest.get(`${ENDPOINT}/rest/data/Product/find`, (_req, res, ctx) =>
					res(ctx.status(400), ctx.json({ success: false, errors: [{ message: CENTER_UNRESOLVED_MESSAGE, code: WITHIN_RADIUS_CENTER_UNRESOLVED }] })),
				),
			);

			const result = await client.find('Product', {
				filter: { match: 'and', conditions: [withinRadiusCondition(TERM, { center: CENTER_REF, radius: RADIUS_METERS })] },
			});

			expect(result.success).to.equal(false);
			const first = (result.errors ?? [])[0] as { message: string; code?: string };
			expect(first.code).to.equal(WITHIN_RADIUS_CENTER_UNRESOLVED);
			expect(first.message).to.equal(CENTER_UNRESOLVED_MESSAGE);
			expect(first.message).to.contain(`Correlation id: ${CORRELATION_ID}`);
		});
	});

	describe('Module.find (o caminho do produto — lança a exceção tipada)', () => {
		// `Client.find` devolve o resultado; quem LANÇA é `Module`. Sem este bloco,
		// nada aqui provava que um 400 de `within_radius` chega ao chamador como
		// exceção tipada — só que o mapeador, chamado à mão, produz a classe certa.
		// O SDK Python já testava pelo `client.find`, que lança; esta é a rota
		// equivalente no TS.
		const module = new ProductModule({ endpoint: ENDPOINT, accessKey: 'fake-key' });
		const filterWith = (value: Parameters<typeof withinRadiusCondition>[1]) =>
			({ match: 'and', conditions: [withinRadiusCondition(TERM, value)] }) as never;

		it('400 de valor inválido chega como KonectyWithinRadiusValueError', async () => {
			server.use(
				rest.get(`${ENDPOINT}/rest/data/Product/find`, (_req, res, ctx) =>
					res(ctx.status(400), ctx.json({ success: false, errors: [{ message: INVALID_VALUE_MESSAGE, code: WITHIN_RADIUS_INVALID_VALUE }] })),
				),
			);

			const error = await module.find(filterWith({ center: CENTER, radius: -1 })).then(
				() => null,
				(rejection: unknown) => rejection,
			);

			expect(error).to.be.instanceOf(KonectyWithinRadiusValueError);
			expect((error as KonectyWithinRadiusValueError).code).to.equal(WITHIN_RADIUS_INVALID_VALUE);
			expect((error as Error).message).to.equal(INVALID_VALUE_MESSAGE);
		});

		it('400 de centro não resolvido chega como KonectyWithinRadiusCenterError, id de correlação incluído', async () => {
			server.use(
				rest.get(`${ENDPOINT}/rest/data/Product/find`, (_req, res, ctx) =>
					res(ctx.status(400), ctx.json({ success: false, errors: [{ message: CENTER_UNRESOLVED_MESSAGE, code: WITHIN_RADIUS_CENTER_UNRESOLVED }] })),
				),
			);

			const error = await module.find(filterWith({ center: CENTER_REF, radius: RADIUS_METERS })).then(
				() => null,
				(rejection: unknown) => rejection,
			);

			expect(error).to.be.instanceOf(KonectyWithinRadiusCenterError);
			expect((error as KonectyWithinRadiusCenterError).code).to.equal(WITHIN_RADIUS_CENTER_UNRESOLVED);
			expect((error as Error).message).to.equal(CENTER_UNRESOLVED_MESSAGE);
			expect((error as Error).message).to.contain(`Correlation id: ${CORRELATION_ID}`);
		});
	});
});

/**
 * Códigos acrescentados depois, quando o servidor ganhou teto de profundidade e
 * cota de centros por requisição. Mesma entrada e mesma saída no SDK Python:
 * `tests/test_within_radius.py`, `TestDepthAndQuotaCodes`.
 *
 * As mensagens saem de `src/imports/data/filters/hydrateFilterCenters.ts` no repo
 * Konecty. Note que já são TRÊS textos diferentes sob o guarda-chuva de "centro
 * não resolvido" — por isso o SDK ramifica pelo `.code`, nunca pelo texto.
 */
describe('within_radius: profundidade e cota de centros', () => {
	const DEPTH_MESSAGE =
		'Could not resolve the center record for operator within_radius on term "address": center hydration exceeded the maximum depth of 3.';
	const QUOTA_MESSAGE = 'Operator within_radius resolves at most 20 center records per request; this request asked for 34.';

	it('mapeia WITHIN_RADIUS_CENTER_DEPTH_EXCEEDED preservando a mensagem inteira', () => {
		const error = konectyErrorFromErrors([{ message: DEPTH_MESSAGE, code: WITHIN_RADIUS_CENTER_DEPTH_EXCEEDED }]);

		expect(error).to.be.instanceOf(KonectyWithinRadiusCenterDepthError);
		expect((error as KonectyWithinRadiusCenterDepthError).code).to.equal(WITHIN_RADIUS_CENTER_DEPTH_EXCEEDED);
		expect(error.message).to.equal(DEPTH_MESSAGE);
	});

	it('depth é PEGÁVEL como KonectyWithinRadiusCenterError — quem tratava centro antes segue tratando', () => {
		// A hierarquia é a promessa: o codigo novo nao quebra `catch` que ja existia.
		const error = konectyErrorFromErrors([{ message: DEPTH_MESSAGE, code: WITHIN_RADIUS_CENTER_DEPTH_EXCEEDED }]);

		expect(error).to.be.instanceOf(KonectyWithinRadiusCenterError);
	});

	it('mapeia WITHIN_RADIUS_TOO_MANY_CENTERS preservando a mensagem inteira', () => {
		const error = konectyErrorFromErrors([{ message: QUOTA_MESSAGE, code: WITHIN_RADIUS_TOO_MANY_CENTERS }]);

		expect(error).to.be.instanceOf(KonectyWithinRadiusTooManyCentersError);
		expect((error as KonectyWithinRadiusTooManyCentersError).code).to.equal(WITHIN_RADIUS_TOO_MANY_CENTERS);
		expect(error.message).to.equal(QUOTA_MESSAGE);
	});

	it('cota NÃO é falha de centro — nenhum registro especifico falhou', () => {
		// Se cota herdasse de CenterError, o chamador procuraria um registro culpado
		// que nao existe: a requisicao foi recusada antes de qualquer leitura.
		const error = konectyErrorFromErrors([{ message: QUOTA_MESSAGE, code: WITHIN_RADIUS_TOO_MANY_CENTERS }]);

		expect(error).to.not.be.instanceOf(KonectyWithinRadiusCenterError);
	});
});
