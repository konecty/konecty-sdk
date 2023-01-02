import { KonectyClient, KonectyClientOptions, KonectyFindResult } from '@konecty/sdk/Client';
import { expect } from 'chai';
import { rest } from 'msw';
import { Product } from '../../__test__/fixtures/types/Product';
import { server } from '../../__test__/setup-test';
import clientProductsResponse from '../fixtures/konecty/find-client-products.json';

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
});
