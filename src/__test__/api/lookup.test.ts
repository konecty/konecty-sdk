import { KonectyClient, KonectyFindResult } from '@konecty/sdk/Client';
import { expect } from 'chai';

import { rest } from 'msw';
import productResult from '../fixtures/konecty/lookup-campaign-products.json';
import { CampaignModule, CampaignProductType } from '../fixtures/types/Campaign';
import { server } from '../setup-test';

describe('Konecty Retrive Documents', () => {
	beforeAll(async () => {
		KonectyClient.defaults.endpoint = 'http://localhost:3000';
		KonectyClient.defaults.accessKey = 'fake-key';
	});

	it('Should options list for products', async () => {
		// Arrange
		const campaignModule = new CampaignModule();

		server.use(
			rest.get('http://localhost:3000/rest/data/Campaign/lookup/product', (req, res, ctx) => {
				return res.once(ctx.status(200), ctx.json(productResult));
			}),
		);

		// Act

		const result: KonectyFindResult<CampaignProductType> | null = await campaignModule.product.lookup('test');

		// Assert
		expect(result?.success).to.be.true;
	});
});
