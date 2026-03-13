import { KonectyClient, KonectyClientOptions } from '@konecty/sdk/Client';
import { expect } from 'chai';
import { rest } from 'msw';
import { server } from '../../__test__/setup-test';

describe('Konecty downloadFile and downloadImage', () => {
	const options: KonectyClientOptions = {
		endpoint: 'http://localhost:3000',
		accessKey: 'fake-key',
	};

	it('should return ArrayBuffer from downloadFile', async () => {
		const body = new Uint8Array([1, 2, 3]);
		server.use(
			rest.get(
				'http://localhost:3000/rest/file/Product/CODE123/attachments/doc.pdf',
				(req, res, ctx) => {
					return res(ctx.status(200), ctx.body(body));
				},
			),
		);

		const client = new KonectyClient(options);
		const result = await client.downloadFile('Product', 'CODE123', 'attachments', 'doc.pdf');

		expect(result).to.be.instanceOf(ArrayBuffer);
		expect(new Uint8Array(result)).to.deep.equal(body);
	});

	it('should throw on downloadFile 4xx', async () => {
		server.use(
			rest.get('http://localhost:3000/rest/file/Product/CODE123/attachments/doc.pdf', (req, res, ctx) => {
				return res(ctx.status(404));
			}),
		);

		const client = new KonectyClient(options);
		try {
			await client.downloadFile('Product', 'CODE123', 'attachments', 'doc.pdf');
			expect.fail('should have thrown');
		} catch (e) {
			expect((e as Error).message).to.include('404');
		}
	});

	it('should return ArrayBuffer from downloadImage (full)', async () => {
		const body = new Uint8Array([0xff, 0xd8, 0xff]);
		server.use(
			rest.get(
				'http://localhost:3000/rest/image/Product/recId/photo/image.jpg',
				(req, res, ctx) => res(ctx.status(200), ctx.body(body)),
			),
		);

		const client = new KonectyClient(options);
		const result = await client.downloadImage('Product', 'recId', 'photo', 'image.jpg');

		expect(result).to.be.instanceOf(ArrayBuffer);
		expect(new Uint8Array(result)).to.deep.equal(body);
	});

	it('should use style path for downloadImage(style: thumb)', async () => {
		server.use(
			rest.get(
				'http://localhost:3000/rest/image/thumb/Product/recId/photo/image.jpg',
				(req, res, ctx) => res(ctx.status(200), ctx.body(new Uint8Array([1]))),
			),
		);

		const client = new KonectyClient(options);
		const result = await client.downloadImage('Product', 'recId', 'photo', 'image.jpg', 'thumb');

		expect(result).to.be.instanceOf(ArrayBuffer);
		expect(result.byteLength).to.equal(1);
	});

	it('should throw on downloadImage 403', async () => {
		server.use(
			rest.get('http://localhost:3000/rest/image/Product/recId/photo/image.jpg', (req, res, ctx) => {
				return res(ctx.status(403));
			}),
		);

		const client = new KonectyClient(options);
		try {
			await client.downloadImage('Product', 'recId', 'photo', 'image.jpg');
			expect.fail('should have thrown');
		} catch (e) {
			expect((e as Error).message).to.include('403');
		}
	});
});
