import { KonectyClient } from '@konecty/sdk/Client';
import type { KonectyFindParams } from '@konecty/sdk/Client';
import type { CrossModuleQuery } from '@konecty/sdk/types/crossModuleQuery';
import type { Computed, DerivedExpression } from '@konecty/sdk/types/derived';
import { expect } from 'chai';

import { rest } from 'msw';
import { server } from '../../__test__/setup-test';

/**
 * Campo derivado (`computed`) — ADR-0025 no repo Konecty, spec `campos-derivados` (DRV-15).
 *
 * **Paridade com o SDK Python: `tests/test_derived_fields.py`** usa a MESMA entrada
 * (mesmo `computed`, mesmo filtro pelo alias, mesmo corpo de consulta cross-module)
 * e espera a MESMA saída. Alterar um destes literais sem alterar o outro arquivo
 * quebra a paridade que o `AGENTS.md` do Konecty exige entre os dois SDKs.
 *
 * O contrato é do servidor (`src/imports/data/derived/expression.ts` no repo Konecty):
 * `computed: { alias: { op: 'add'|'subtract'|'multiply'|'coalesce', args } }`, com
 * `args` string = campo, number = literal, objeto = nó aninhado. Em
 * `/rest/data/:document/find` vai na QUERY STRING como JSON, nas duas verbas (o body
 * do POST continua sendo o filtro); em `/rest/query/json` vai no corpo. O SDK **não**
 * valida alias, aridade, limites nem permissão — quem decide é o servidor
 * (`DERIVED_FIELD_INVALID` / `DERIVED_FIELD_UNAVAILABLE`), e um limite copiado aqui
 * passaria a mentir assim que o backend mudasse. Mesma postura do `within_radius`.
 *
 * ## O que "mesma URL" quer dizer entre os dois SDKs
 *
 * Aqui a query string crua é travada byte a byte (`URLSearchParams` percent-encoda
 * tudo: `%7B`, `%22`, `%3A`, `%2C`). O SDK Python monta a mesma query com
 * `json.dumps` (separadores com espaço) e `yarl` (deixa `:` e `,` sem codificar), uma
 * diferença pré-existente a esta feature e comum a TODO parâmetro de `find`. Por isso
 * o teste Python trava o VALOR decodificado e compactado contra o MESMO
 * `EXPECTED_COMPUTED_JSON` deste arquivo, mais os invariantes da query crua (nenhum
 * `{`, `"` ou espaço solto; `unquote_plus(raw) == enviado`) — o mesmo padrão de
 * `withinRadius.test.ts` × `test_within_radius.py`.
 */

/** `iptuCond = tax + coalesce(condominiumAmount, 0)` — o exemplo de referência da spec. */
const COMPUTED: Computed = {
	iptuCond: { op: 'add', args: ['tax', { op: 'coalesce', args: ['condominiumAmount', 0] }] },
};

/** Filtro pelo alias, com operador numérico — é o que o servidor compila em `$expr`. */
const FILTER = { match: 'and', conditions: [{ term: 'iptuCond', operator: 'less_than', value: 1000 }] };

/** Serialização exata de `computed`. O SDK Python assevera a MESMA string. */
const EXPECTED_COMPUTED_JSON = '{"iptuCond":{"op":"add","args":["tax",{"op":"coalesce","args":["condominiumAmount",0]}]}}';

const EXPECTED_FILTER_JSON = '{"match":"and","conditions":[{"term":"iptuCond","operator":"less_than","value":1000}]}';

/**
 * A query string inteira, crua, de `client.find('Product', { filter, computed })`:
 * `filter` primeiro, `computed` depois (ordem de inserção das opções), cada um
 * `JSON.stringify` + form-urlencoded. Nenhum caractere do JSON escapa sem codificação.
 */
const EXPECTED_FIND_SEARCH =
	'?filter=%7B%22match%22%3A%22and%22%2C%22conditions%22%3A%5B%7B%22term%22%3A%22iptuCond%22%2C%22operator%22%3A%22less_than%22%2C%22value%22%3A1000%7D%5D%7D' +
	'&computed=%7B%22iptuCond%22%3A%7B%22op%22%3A%22add%22%2C%22args%22%3A%5B%22tax%22%2C%7B%22op%22%3A%22coalesce%22%2C%22args%22%3A%5B%22condominiumAmount%22%2C0%5D%7D%5D%7D%7D';

const ENDPOINT = 'http://localhost:3000';

describe('campo derivado (computed)', () => {
	const client = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-key' });

	describe('Client.find (query string — é onde os dois SDKs já divergiram)', () => {
		it('põe computed na query string como JSON, ao lado do filter, byte a byte', async () => {
			let computedParam: string | null = null;
			let filterParam: string | null = null;
			let rawSearch = '';

			server.use(
				rest.get(`${ENDPOINT}/rest/data/Product/find`, (req, res, ctx) => {
					computedParam = req.url.searchParams.get('computed');
					filterParam = req.url.searchParams.get('filter');
					rawSearch = req.url.search;
					return res(ctx.status(200), ctx.json({ success: true, data: [], total: 0 }));
				}),
			);

			await client.find('Product', { filter: FILTER, computed: COMPUTED });

			// Decodificado: `computed` chega exatamente como o SDK Python o envia.
			expect(computedParam).to.equal(EXPECTED_COMPUTED_JSON);
			expect(filterParam).to.equal(EXPECTED_FILTER_JSON);
			// Cru: a URL literal, inteira.
			expect(rawSearch).to.equal(EXPECTED_FIND_SEARCH);
		});

		it('sem computed a query string é a de sempre — a opção é opt-in', async () => {
			let rawSearch = '';

			server.use(
				rest.get(`${ENDPOINT}/rest/data/Product/find`, (req, res, ctx) => {
					rawSearch = req.url.search;
					return res(ctx.status(200), ctx.json({ success: true, data: [], total: 0 }));
				}),
			);

			await client.find('Product', { filter: FILTER });

			expect(rawSearch).to.not.contain('computed');
		});

		it('o alias de cada registro chega ao chamador como número', async () => {
			server.use(
				rest.get(`${ENDPOINT}/rest/data/Product/find`, (_req, res, ctx) =>
					res(
						ctx.status(200),
						ctx.json({
							success: true,
							data: [
								{ _id: 'p-1', iptuCond: 420 },
								{ _id: 'p-2', iptuCond: null },
							],
							total: 2,
						}),
					),
				),
			);

			const result = await client.find<{ iptuCond: number | null }>('Product', { filter: FILTER, computed: COMPUTED });

			// `null` é o valor do alias quando um operando está vazio (semântica SQL): chega como veio.
			expect((result.data ?? []).map(record => record.iptuCond)).to.deep.equal([420, null]);
		});
	});

	describe('executeQueryJson (corpo da consulta cross-module)', () => {
		it('envia computed no corpo, inalterado, ao lado de filter e sort', async () => {
			let receivedBody: CrossModuleQuery | null = null;

			server.use(
				rest.post(`${ENDPOINT}/rest/query/json`, async (req, res, ctx) => {
					receivedBody = await req.json();
					return res(ctx.status(200), ctx.set('X-Total-Count', '1'), ctx.body('{"_id":"p-1","iptuCond":420}\n'), ctx.set('Content-Type', 'application/x-ndjson'));
				}),
			);

			const query: CrossModuleQuery = {
				document: 'Product',
				computed: COMPUTED,
				filter: FILTER as CrossModuleQuery['filter'],
				sort: [{ property: 'iptuCond', direction: 'ASC' }],
			};
			const { stream, total } = await client.executeQueryJson<{ _id: string; iptuCond: number }>(query);

			const body = receivedBody as unknown as CrossModuleQuery;
			expect(JSON.stringify(body.computed)).to.equal(EXPECTED_COMPUTED_JSON);
			expect(body.document).to.equal('Product');
			expect(JSON.stringify(body.filter)).to.equal(EXPECTED_FILTER_JSON);
			expect(body.sort).to.deep.equal([{ property: 'iptuCond', direction: 'ASC' }]);

			const records = [];
			for await (const record of stream) records.push(record);
			expect(records).to.deep.equal([{ _id: 'p-1', iptuCond: 420 }]);
			expect(total).to.equal(1);
		});
	});

	describe('tipos exportados', () => {
		it('types/derived é subpath público do pacote (exports + typesVersions), como graph e pivot', () => {
			// O import `@konecty/sdk/types/derived` deste arquivo só resolve porque o Jest
			// remapeia para `src`. No pacote publicado o `exports` não tem entrada raiz `"."`,
			// então todo tipo é consumido por subpath — e sem estas duas entradas o
			// consumidor não consegue nomear `Computed`/`DerivedExpression`.
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const pkg = require('../../../package.json');
			expect(pkg.exports['./types/derived']).to.equal('./dist/sdk/types/derived.js');
			expect(pkg.typesVersions['*']['types/derived']).to.deep.equal(['./dist/sdk/types/derived.d.ts']);
		});

		it('DerivedExpression/Computed são o contrato do servidor — op fora da lista não compila', () => {
			// Trava de compilação (ts-jest roda com diagnostics): se o tipo passar a aceitar
			// `divide` (fora do escopo do ADR-0025), o `@ts-expect-error` fica sem erro e o
			// arquivo não compila.
			// @ts-expect-error — `divide` não é um DerivedOp
			const divide: DerivedExpression = { op: 'divide', args: ['tax', 2] };
			const nested: DerivedExpression = { op: 'multiply', args: [{ op: 'subtract', args: ['price', 'discount'] }, 0.1] };
			const findParams: KonectyFindParams = { filter: FILTER, computed: { fee: nested } };
			const query: CrossModuleQuery = { document: 'Product', computed: { fee: nested }, groupBy: ['fee'] };

			expect([divide, findParams, query]).to.have.length(3);
		});
	});
});
