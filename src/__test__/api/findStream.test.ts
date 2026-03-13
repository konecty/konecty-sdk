import { KonectyClient, KonectyClientOptions } from '@konecty/sdk/Client';
import { expect } from 'chai';
import { rest } from 'msw';
import { server } from '../../__test__/setup-test';

describe('Konecty findStream and streamCount', () => {
	const options: KonectyClientOptions = {
		endpoint: 'http://localhost:3000',
		accessKey: 'fake-key',
	};

	it('should return stream and total when includeTotal is true', async () => {
		const ndjsonBody = '{"_id":"1","name":"A"}\n{"_id":"2","name":"B"}\n';
		server.use(
			rest.get('http://localhost:3000/rest/stream/Product/findStream', (req, res, ctx) => {
				return res(
					ctx.status(200),
					ctx.set('X-Total-Count', '2'),
					ctx.body(ndjsonBody),
					ctx.set('Content-Type', 'application/json'),
				);
			}),
		);

		const client = new KonectyClient(options);
		const result = await client.findStream('Product', {
			filter: { match: 'and', conditions: [] },
		}, true);

		expect(result.total).to.equal(2);
		const records: object[] = [];
		for await (const record of result.stream) {
			records.push(record);
		}
		expect(records).to.have.lengthOf(2);
		expect(records[0]).to.deep.include({ _id: '1', name: 'A' });
		expect(records[1]).to.deep.include({ _id: '2', name: 'B' });
	});

	it('should return stream without total when includeTotal is false', async () => {
		server.use(
			rest.get('http://localhost:3000/rest/stream/Product/findStream', (req, res, ctx) => {
				return res(ctx.status(200), ctx.body('{"_id":"1"}\n'), ctx.set('Content-Type', 'application/json'));
			}),
		);

		const client = new KonectyClient(options);
		const result = await client.findStream('Product', { filter: { match: 'and', conditions: [] } });

		expect(result.total).to.be.undefined;
		const records: object[] = [];
		for await (const record of result.stream) {
			records.push(record);
		}
		expect(records).to.have.lengthOf(1);
		expect(records[0]).to.deep.include({ _id: '1' });
	});

	it('should throw on 4xx', async () => {
		server.use(
			rest.get('http://localhost:3000/rest/stream/Product/findStream', (req, res, ctx) => {
				return res(ctx.status(400), ctx.json({ success: false, errors: ['Bad request'] }));
			}),
		);

		const client = new KonectyClient(options);
		try {
			await client.findStream('Product', { filter: { match: 'and', conditions: [] } });
			expect.fail('should have thrown');
		} catch (e) {
			expect((e as Error).message).to.include('400');
		}
	});

	it('should return count from streamCount', async () => {
		server.use(
			rest.get('http://localhost:3000/rest/stream/Product/count', (req, res, ctx) => {
				return res(ctx.status(200), ctx.json({ success: true, total: 42 }));
			}),
		);

		const client = new KonectyClient(options);
		const result = await client.streamCount('Product', {
			filter: { match: 'and', conditions: [{ term: 'status', operator: 'equals', value: 'Active' }] },
		});

		expect(result.success).to.be.true;
		expect(result.total).to.equal(42);
	});

	it('should throw on streamCount 4xx', async () => {
		server.use(
			rest.get('http://localhost:3000/rest/stream/Product/count', (req, res, ctx) => {
				return res(ctx.status(403), ctx.json({ success: false }));
			}),
		);

		const client = new KonectyClient(options);
		try {
			await client.streamCount('Product', { filter: { match: 'and', conditions: [] } });
			expect.fail('should have thrown');
		} catch (e) {
			expect((e as Error).message).to.include('403');
		}
	});
});
