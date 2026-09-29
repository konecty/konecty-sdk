import { KonectyClient } from '@konecty/sdk/Client';
import { KonectyDocument, KonectyModule, ModuleConfig } from '@konecty/sdk/Module';
import { expect } from 'chai';

import { rest } from 'msw';
import { server } from '../../__test__/setup-test';

const ENDPOINT = 'http://localhost:3000';

/**
 * Paridade com o SDK Python: `tests/test_find_get_total.py` usa a MESMA entrada
 * (filtro `{match: 'and', conditions: [], filters: []}`, `limit: 10`), as MESMAS
 * respostas e espera a MESMA saída.
 *
 * Com `getTotal: false` o Konecty não conta os registros e a resposta vem sem
 * `total`. A opção só vai para a rede quando desligada: ausente ou `true`, a URL
 * continua idêntica à de antes, byte a byte.
 *
 * Sobre a comparação de query string entre os SDKs: o valor de `filter` já é
 * codificado de forma diferente por cada linguagem (JSON sem espaços +
 * URLSearchParams aqui, `json.dumps` com espaços + yarl lá), divergência anterior
 * a esta opção e inócua porque o servidor faz parse do JSON. Por isso o que é
 * comparado entre os dois lados é o conjunto de parâmetros decodificados e o
 * trecho cru `&getTotal=false` no fim da query.
 */
const FILTER = { match: 'and', conditions: [], filters: [] };
const QUERY_TODAY = '?filter=%7B%22match%22%3A%22and%22%2C%22conditions%22%3A%5B%5D%2C%22filters%22%3A%5B%5D%7D&limit=10';

const BODY_WITHOUT_TOTAL = { success: true, data: [{ _id: 'a' }] };
const BODY_WITH_TOTAL = { success: true, data: [{ _id: 'a' }], total: 1 };

type Captured = { search: string; params: Record<string, string> };

function stubFind(body: object): Captured {
	const captured: Captured = { search: '', params: {} };
	server.use(
		rest.get(`${ENDPOINT}/rest/data/Product/find`, (req, res, ctx) => {
			captured.search = req.url.search;
			captured.params = Object.fromEntries(req.url.searchParams.entries());
			return res.once(ctx.status(200), ctx.json(body));
		}),
	);
	return captured;
}

const productConfig: ModuleConfig = {
	name: 'Product',
	collection: 'data.Product',
	label: { en: 'Product' },
	plurals: { en: 'Products' },
};

describe('getTotal na busca', () => {
	const client = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-key' });
	const module = new KonectyModule<KonectyDocument<never, never, never>>(productConfig, {
		endpoint: ENDPOINT,
		accessKey: 'fake-key',
	});

	describe('Client.find', () => {
		it('getTotal: false envia getTotal=false e aceita resposta sem total', async () => {
			const captured = stubFind(BODY_WITHOUT_TOTAL);

			const result = await client.find('Product', { filter: FILTER, limit: 10, getTotal: false });

			expect(captured.search.endsWith('&getTotal=false')).to.equal(true);
			expect(captured.search.match(/getTotal=/g)).to.have.length(1);
			expect(captured.params).to.deep.equal({ filter: JSON.stringify(FILTER), limit: '10', getTotal: 'false' });
			expect(result.success).to.equal(true);
			expect(result.data).to.deep.equal([{ _id: 'a' }]);
			expect(result.total).to.equal(undefined);
		});

		it('sem a opção a query é a de hoje e o total vem', async () => {
			const captured = stubFind(BODY_WITH_TOTAL);

			const result = await client.find('Product', { filter: FILTER, limit: 10 });

			expect(captured.search).to.equal(QUERY_TODAY);
			expect(result.total).to.equal(1);
		});

		it('getTotal: true não envia nada (mesma query de hoje)', async () => {
			const captured = stubFind(BODY_WITH_TOTAL);

			const result = await client.find('Product', { filter: FILTER, limit: 10, getTotal: true });

			expect(captured.search).to.equal(QUERY_TODAY);
			expect(result.total).to.equal(1);
		});
	});

	describe('Module.find', () => {
		it('getTotal: false envia getTotal=false e devolve sem count', async () => {
			const captured = stubFind(BODY_WITHOUT_TOTAL);

			const result = await module.find(FILTER as never, { start: 0, limit: 10, getTotal: false });

			expect(captured.params.getTotal).to.equal('false');
			expect(captured.search.endsWith('&getTotal=false')).to.equal(true);
			expect(result.data).to.deep.equal([{ _id: 'a' }]);
			expect('count' in result).to.equal(false);
		});

		it('sem a opção não envia getTotal e devolve count', async () => {
			const captured = stubFind(BODY_WITH_TOTAL);

			const result = await module.find(FILTER as never, { start: 0, limit: 10 });

			expect(captured.params).to.not.have.property('getTotal');
			expect(result.count).to.equal(1);
		});
	});
});
