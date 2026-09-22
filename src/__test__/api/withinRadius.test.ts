import {
	KonectyClient,
	KonectyWithinRadiusCenterError,
	KonectyWithinRadiusValueError,
	konectyErrorFromErrors,
	WITHIN_RADIUS,
	WITHIN_RADIUS_CENTER_UNRESOLVED,
	WITHIN_RADIUS_INVALID_VALUE,
	withinRadiusCondition,
} from '@konecty/sdk/Client';
import type { WithinRadiusCenterRef, WithinRadiusCoordinatePair } from '@konecty/sdk/Client';
import { expect } from 'chai';

import { rest } from 'msw';
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

const CENTER_UNRESOLVED_MESSAGE = 'Could not resolve the center record for operator within_radius on term "address".';

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
	});

	describe('códigos de erro do servidor', () => {
		it('WITHIN_RADIUS_INVALID_VALUE vira KonectyWithinRadiusValueError, não Error genérico', () => {
			const error = konectyErrorFromErrors([{ message: INVALID_VALUE_MESSAGE, code: WITHIN_RADIUS_INVALID_VALUE }]);

			expect(error).to.be.instanceOf(KonectyWithinRadiusValueError);
			expect((error as KonectyWithinRadiusValueError).code).to.equal('WITHIN_RADIUS_INVALID_VALUE');
			// A mensagem do servidor nomeia o termo e a chave que falhou; perdê-la é o pior modo de falha.
			expect(error.message).to.equal(INVALID_VALUE_MESSAGE);
		});

		it('WITHIN_RADIUS_CENTER_UNRESOLVED vira KonectyWithinRadiusCenterError', () => {
			const error = konectyErrorFromErrors([{ message: CENTER_UNRESOLVED_MESSAGE, code: WITHIN_RADIUS_CENTER_UNRESOLVED }]);

			expect(error).to.be.instanceOf(KonectyWithinRadiusCenterError);
			expect((error as KonectyWithinRadiusCenterError).code).to.equal('WITHIN_RADIUS_CENTER_UNRESOLVED');
			expect(error.message).to.equal(CENTER_UNRESOLVED_MESSAGE);
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
		});
	});
});
