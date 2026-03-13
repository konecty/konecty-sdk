import { KonectyClient, KonectyClientOptions, KpiConfig } from '@konecty/sdk/Client';
import { expect } from 'chai';
import { rest } from 'msw';
import { server } from '../../__test__/setup-test';

describe('Konecty getKpi', () => {
	const options: KonectyClientOptions = {
		endpoint: 'http://localhost:3000',
		accessKey: 'fake-key',
	};

	it('should return value and count for count operation', async () => {
		server.use(
			rest.get('http://localhost:3000/rest/data/Product/kpi', (req, res, ctx) => {
				return res(ctx.status(200), ctx.json({ success: true, value: 42, count: 42 }));
			}),
		);

		const client = new KonectyClient(options);
		const kpiConfig: KpiConfig = { operation: 'count' };
		const result = await client.getKpi('Product', kpiConfig);

		expect(result.success).to.be.true;
		expect(result.value).to.equal(42);
		expect(result.count).to.equal(42);
	});

	it('should send kpiConfig and filter in query', async () => {
		server.use(
			rest.get('http://localhost:3000/rest/data/Product/kpi', (req, res, ctx) => {
				const kpiConfig = req.url.searchParams.get('kpiConfig');
				const filter = req.url.searchParams.get('filter');
				expect(kpiConfig).to.equal(JSON.stringify({ operation: 'sum', field: 'amount' }));
				expect(filter).to.be.a('string');
				return res(ctx.status(200), ctx.json({ success: true, value: 1000, count: 10 }));
			}),
		);

		const client = new KonectyClient(options);
		await client.getKpi('Product', { operation: 'sum', field: 'amount' }, {
			filter: { match: 'and', conditions: [] },
		});
	});

	it('should throw on 4xx', async () => {
		server.use(
			rest.get('http://localhost:3000/rest/data/Product/kpi', (req, res, ctx) => {
				return res(ctx.status(400), ctx.json({ success: false, errors: ['kpiConfig required'] }));
			}),
		);

		const client = new KonectyClient(options);
		try {
			await client.getKpi('Product', { operation: 'count' });
			expect.fail('should have thrown');
		} catch (e) {
			expect((e as Error).message).to.include('400');
		}
	});
});
