import { konectyErrorFromErrors, KonectyClient, KonectySortLimitError, SORT_ABOVE_MAX_PAGE_SIZE } from '@konecty/sdk/Client';
import { expect } from 'chai';

import { rest } from 'msw';
import { server } from '../../__test__/setup-test';

const ENDPOINT = 'http://localhost:3000';

/**
 * Paridade com o SDK Python: `tests/test_sort_limit.py` usa a MESMA resposta e
 * espera a MESMA saída.
 *
 * Acima do teto de página o Konecty recusa ordenação arbitrária com HTTP 400 e
 * `SORT_ABOVE_MAX_PAGE_SIZE` (antes trocava o sort por `{_id: 1}` em silêncio e
 * devolvia 200 com os dados fora de ordem). Os dois SDKs descartavam o corpo do
 * 400 e reportavam `"400 - Bad Request"`, então nem o código nem a instrução de
 * como corrigir a chamada chegavam a quem chamou.
 */
const SORT_REJECTION_MESSAGE =
	'Sorting by [name] is not supported above 1000 records (requested limit: 5000). ' +
	'Sort by _id (ascending or descending) and paginate with an _id range filter, or request at most 1000 records.';

const SORT_REJECTION_BODY = {
	success: false,
	errors: [{ message: SORT_REJECTION_MESSAGE, code: SORT_ABOVE_MAX_PAGE_SIZE }],
};

describe('sort acima do teto de página', () => {
	const client = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-key' });

	describe('Client.find (devolve o resultado, não lança)', () => {
		it('preserva o code e a mensagem do servidor', async () => {
			server.use(rest.get(`${ENDPOINT}/rest/data/Product/find`, (_req, res, ctx) => res(ctx.status(400), ctx.json(SORT_REJECTION_BODY))));

			const result = await client.find('Product', { filter: { conditions: [] }, sort: [{ property: 'name', direction: 'ASC' }], limit: 5000 } as never);

			expect(result.success).to.equal(false);
			const first = (result.errors ?? [])[0] as { message: string; code?: string };
			expect(first.code).to.equal(SORT_ABOVE_MAX_PAGE_SIZE);
			expect(first.message).to.equal(SORT_REJECTION_MESSAGE);
		});

		it('mantém `status - statusText` quando o erro não traz code', async () => {
			// Deliberado: só o erro com `code` passa a vir do corpo. Trocar a mensagem de
			// todos os erros seria mudança de contrato além do que este código exige.
			server.use(rest.get(`${ENDPOINT}/rest/data/Product/find`, (_req, res, ctx) => res(ctx.status(502), ctx.text('<html>gateway</html>'))));

			const result = await client.find('Product', { filter: { conditions: [] }, limit: 10 } as never);

			expect(result.success).to.equal(false);
			expect(((result.errors ?? [])[0] as { message: string }).message).to.contain('502');
		});
	});

	describe('konectyErrorFromErrors (o que os métodos de Module lançam)', () => {
		it('lança KonectySortLimitError com o code, e não um Error genérico', () => {
			const error = konectyErrorFromErrors(SORT_REJECTION_BODY.errors);

			expect(error).to.be.instanceOf(KonectySortLimitError);
			expect((error as KonectySortLimitError).code).to.equal(SORT_ABOVE_MAX_PAGE_SIZE);
			// A mensagem diz COMO corrigir a chamada; perdê-la era o pior do bug.
			expect(error.message).to.contain('_id');
			expect(error.message).to.contain('1000');
		});

		it('mantém Error genérico para os demais erros', () => {
			const error = konectyErrorFromErrors([{ message: 'Some other failure' }]);

			expect(error).to.be.instanceOf(Error);
			expect(error).to.not.be.instanceOf(KonectySortLimitError);
			expect(error.message).to.equal('Some other failure');
		});

		it('aceita a forma antiga de errors como string[]', () => {
			const error = konectyErrorFromErrors(['plain message']);

			expect(error).to.not.be.instanceOf(KonectySortLimitError);
			expect(error.message).to.equal('plain message');
		});
	});
});
