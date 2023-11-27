import { History, KonectyClient, KonectyClientOptions, KonectyFindResult } from '@konecty/sdk/Client';
import { expect } from 'chai';
import { rest } from 'msw';
import { Product } from '../../__test__/fixtures/types/Product';
import { server } from '../../__test__/setup-test';
import clientProductsResponse from '../fixtures/konecty/find-client-products.json';
import getDocumentProducts from '../fixtures/konecty/get-document-products.json';
import getFormProductResponse from '../fixtures/konecty/get-form-products-default.json';
import getListViewProductResponse from '../fixtures/konecty/get-list-view-products-default.json';
import getMenuMainResponse from '../fixtures/konecty/get-menu-main.json';
import getNextOnQueueResponse from '../fixtures/konecty/get-next-on-queue.json';
import productHistoryResponse from '../fixtures/konecty/get-product-history.json';

describe('Konecty Client Tests', () => {
	it('should create a client', () => {
		// Arrange
		const options: KonectyClientOptions = {
			endpoint: 'http://localhost:3000',
			accessKey: 'asdfasdfsadfsadf',
		};
		// Act
		const client = new KonectyClient(options);

		// Assert
		expect(client).to.be.instanceOf(KonectyClient);
	});

	it('should serialize and deserialize dates', async () => {
		// Arrange
		const options: KonectyClientOptions = {
			endpoint: 'http://localhost:3000',
			accessKey: 'asdfasdfsadfsadf',
		};
		const client = new KonectyClient(options);
		server.use(
			rest.get('http://localhost:3000/rest/data/Product/find', (req, res, ctx) => {
				return res.once(ctx.status(200), ctx.json(clientProductsResponse));
			}),
		);

		// Act
		const product: KonectyFindResult<Product> = await client.find('product', {
			filter: {
				match: 'and',
				conditions: [
					{
						term: '_id',
						operator: 'equals',
						value: '51547ab4e4b017ed0a26f109',
					},
				],
			},
		});

		// Assert
		expect(product.data?.[0]._createdAt).to.be.instanceOf(Date);
		expect(product.data?.[0]._updatedAt).to.be.instanceOf(Date);
	});

	it('should not serialize and deserialize numbers', async () => {
		// Arrange
		const options: KonectyClientOptions = {
			endpoint: 'http://localhost:3000',
			accessKey: 'asdfasdfsadfsadf',
		};
		const client = new KonectyClient(options);
		server.use(
			rest.get('http://localhost:3000/rest/data/Product/find', (req, res, ctx) => {
				return res.once(ctx.status(200), ctx.json(clientProductsResponse));
			}),
		);

		// Act
		const product: KonectyFindResult<Product> = await client.find('product', {
			filter: {
				match: 'and',
				conditions: [
					{
						term: '_id',
						operator: 'equals',
						value: '51547ab4e4b017ed0a26f109',
					},
				],
			},
		});

		// Assert
		expect(product.data?.[0]?.address?.number).to.be.equal('0336');
	});

	it('should return module history', async () => {
		// Arrange
		const options: KonectyClientOptions = {
			endpoint: 'http://localhost:3000',
			accessKey: 'asdfasdfsadfsadf',
		};
		const client = new KonectyClient(options);
		server.use(
			rest.get('http://localhost:3000/rest/data/Product/productId/history', (req, res, ctx) => {
				return res.once(ctx.status(200), ctx.json(productHistoryResponse));
			}),
		);

		// Act
		const product: KonectyFindResult<History> = await client.getHistory('product', 'productId');

		// Assert
		expect(product?.data?.[0].dataId).to.be.equal('productId');
	});

	it('should return menu main', async () => {
		// Arrange
		const options: KonectyClientOptions = {
			endpoint: 'http://localhost:3000',
			accessKey: 'asdfasdfsadfsadf',
		};
		const client = new KonectyClient(options);
		server.use(
			rest.get('http://localhost:3000/api/menu/main', (req, res, ctx) => {
				return res.once(ctx.status(200), ctx.json(getMenuMainResponse));
			}),
		);

		// Act
		const product = await client.getMenu();

		// Assert
		expect(product?.data?.[0].name).to.be.equal('Activity');
	});

	it('should return list view', async () => {
		// Arrange
		const options: KonectyClientOptions = {
			endpoint: 'http://localhost:3000',
			accessKey: 'asdfasdfsadfsadf',
		};
		const client = new KonectyClient(options);
		server.use(
			rest.get('http://localhost:3000/api/list-view/Product/Default', (req, res, ctx) => {
				return res.once(ctx.status(200), ctx.json(getListViewProductResponse));
			}),
		);

		// Act
		const product = await client.getListView('Product');

		// Assert
		expect(product?.data?.document).to.be.equal('Product');
	});

	it('should return form', async () => {
		// Arrange
		const options: KonectyClientOptions = {
			endpoint: 'http://localhost:3000',
			accessKey: 'asdfasdfsadfsadf',
		};
		const client = new KonectyClient(options);
		server.use(
			rest.get('http://localhost:3000/api/form/Product/Default', (req, res, ctx) => {
				return res.once(ctx.status(200), ctx.json(getFormProductResponse));
			}),
		);

		// Act
		const product = await client.getForm('Product');

		// Assert
		expect(product?.data?.document).to.be.equal('Product');
	});

	it('should return document', async () => {
		// Arrange
		const options: KonectyClientOptions = {
			endpoint: 'http://localhost:3000',
			accessKey: 'asdfasdfsadfsadf',
		};
		const client = new KonectyClient(options);
		server.use(
			rest.get('http://localhost:3000/api/document/Product', (req, res, ctx) => {
				return res.once(ctx.status(200), ctx.json(getDocumentProducts));
			}),
		);

		// Act
		const product = await client.getDocumentNew('Product');

		// Assert
		expect(product?.data?._id).to.be.equal('Product');
	});

	it('should return an array of metas related to a document', async () => {
		// Arrange
		const options: KonectyClientOptions = {
			endpoint: 'http://localhost:3000',
			accessKey: 'asdfasdfsadfsadf',
		};
		const client = new KonectyClient(options);
		server.use(
			rest.get('http://localhost:3000/api/metas/Product', (req, res, ctx) => {
				return res.once(ctx.status(200), ctx.json([getDocumentProducts]));
			}),
		);

		// Act
		const product = await client.getMetasByDocument('Product');

		// Assert
		expect(product?.data?.[0]?._id).to.be.equal('Product');
	});

	it('should return the next on queue', async () => {
		// Arrange
		const options: KonectyClientOptions = {
			endpoint: 'http://localhost:3000',
			accessKey: 'asdfasdfsadfsadf',
		};
		const client = new KonectyClient(options);
		server.use(
			rest.get('http://localhost:3000/rest/data/Queue/queue/next/*', (req, res, ctx) => {
				return res.once(ctx.status(200), ctx.json(getNextOnQueueResponse));
			}),
		);

		// Act
		const queue = await client.getNextOnQueue('queue');

		// Assert
		expect(queue.success).to.be.equal(true);
		expect(queue?.user?.user.name).to.be.equal('Adi Armelin');
	});
});
