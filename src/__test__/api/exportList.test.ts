import { KonectyClient, KonectyClientOptions } from '@konecty/sdk/Client';
import { expect } from 'chai';
import { rest } from 'msw';
import { server } from '../../__test__/setup-test';

describe('Konecty exportList', () => {
	const options: KonectyClientOptions = {
		endpoint: 'http://localhost:3000',
		accessKey: 'fake-key',
	};

	it('should return ArrayBuffer for csv export', async () => {
		const body = new TextEncoder().encode('name,code\nA,1\nB,2');
		server.use(
			rest.get('http://localhost:3000/rest/data/Product/list/Default/csv', (req, res, ctx) => {
				return res(ctx.status(200), ctx.body(body));
			}),
		);

		const client = new KonectyClient(options);
		const result = await client.exportList('Product', 'Default', 'csv');

		expect(result).to.be.instanceOf(ArrayBuffer);
		expect(new TextDecoder().decode(result)).to.include('name,code');
	});

	it('should send filter and sort in query', async () => {
		server.use(
			rest.get('http://localhost:3000/rest/data/Product/list/Default/json', (req, res, ctx) => {
				expect(req.url.searchParams.get('filter')).to.be.a('string');
				expect(req.url.searchParams.get('sort')).to.be.a('string');
				return res(ctx.status(200), ctx.body(new Uint8Array([0x5b, 0x5d]))); // []
			}),
		);

		const client = new KonectyClient(options);
		await client.exportList('Product', 'Default', 'json', {
			filter: { match: 'and', conditions: [] },
			sort: [{ property: 'name', direction: 'ASC' }],
		});
	});

	it('should throw on 403', async () => {
		server.use(
			rest.get('http://localhost:3000/rest/data/Product/list/Default/csv', (req, res, ctx) => {
				return res(ctx.status(403), ctx.json({ success: false, errors: ['Permission denied'] }));
			}),
		);

		const client = new KonectyClient(options);
		try {
			await client.exportList('Product', 'Default', 'csv');
			expect.fail('should have thrown');
		} catch (e) {
			expect((e as Error).message).to.include('403');
		}
	});
});
