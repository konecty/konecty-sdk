import { KonectyClient } from '@konecty/sdk/Client';
import { expect } from 'chai';

import { Campaign, CampaignModule } from '../fixtures/types/Campaign';
import { User, UserModule } from '../fixtures/types/User';

import { rest } from 'msw';
import { server } from '../../__test__/setup-test';

import pick from 'lodash/pick';
import activeUserResponse from '../fixtures/konecty/find-active-users.json';
import adminUserResponse from '../fixtures/konecty/find-admin-user.json';
import findNoResults from '../fixtures/konecty/find-no-results.json';

describe('Konecty Retrive Documents', () => {
	beforeAll(async () => {
		KonectyClient.defaults.endpoint = 'http://localhost:3000';
		KonectyClient.defaults.accessKey = 'fake-key';
	});
	it('Should retrieve admin user from username from a collection', async () => {
		// Arrange
		const userModule = new UserModule();
		server.use(
			rest.get('http://localhost:3000/rest/data/User/find', (req, res, ctx) => {
				return res.once(ctx.status(200), ctx.json(adminUserResponse));
			}),
		);

		// Act
		const user: User | null = await userModule.findOne({
			match: 'and',
			conditions: [
				{
					term: 'username',
					operator: 'equals',
					value: 'admin',
				},
			],
		});

		// Assert
		expect(user).to.not.be.null;
	});

	it('Should retrive active users', async () => {
		// Arrange
		const userModule = new UserModule();

		server.use(
			rest.get('http://localhost:3000/rest/data/User/find', (req, res, ctx) => {
				return res.once(ctx.status(200), ctx.json(activeUserResponse));
			}),
		);

		// Act
		const { count, data } = await userModule.find(
			{
				match: 'and',
				conditions: [
					{
						term: 'active',
						operator: 'equals',
						value: true,
					},
				],
			},
			{
				sort: [
					{
						property: 'name',
						direction: 'ASC',
					},
				],
			},
		);

		// Assert
		expect(count).to.be.equal(2);
		expect(data).to.not.be.null;
		expect(data).to.be.an('array').lengthOf(2);
	});

	it('Should return null when findOne retrieves nothing', async () => {
		// Arrange
		const campaignModule = new CampaignModule();

		server.use(
			rest.get('http://localhost:3000/rest/data/Campaign/find', (req, res, ctx) => {
				return res.once(ctx.status(200), ctx.json(findNoResults));
			}),
		);

		// Act
		const campaign: Campaign | null = await campaignModule.findOne({
			match: 'and',
			conditions: [
				{
					term: 'code',
					operator: 'equals',
					value: -1,
				},
			],
		});

		// Assert
		expect(campaign).to.be.null;
	});

	it('Should retrive active users, only _id, code and name', async () => {
		// Arrange
		const userModule = new UserModule();

		let fieldsParam;
		server.use(
			rest.get('http://localhost:3000/rest/data/User/find', (req, res, ctx) => {
				fieldsParam = req.url.searchParams.get('fields');
				return res.once(
					ctx.status(200),
					ctx.json({
						success: true,
						data: activeUserResponse.data.map(p => pick(p, ['_id', 'code', 'name'])),
						total: 2,
					}),
				);
			}),
		);

		// Act
		const { count, data } = await userModule.find(
			{
				match: 'and',
				conditions: [
					{
						term: 'active',
						operator: 'equals',
						value: true,
					},
				],
			},
			{
				sort: [
					{
						property: 'name',
						direction: 'ASC',
					},
				],
				fields: ['code', 'name'],
			},
		);

		// Assert
		expect(fieldsParam).to.be.equals('code,name');
		expect(count).to.be.equal(2);
		expect(data).to.not.be.null;
		expect(data).to.be.an('array').lengthOf(2);
	});

	it('Should retrieve admin user from username with only _id, code and name', async () => {
		// Arrange
		const userModule = new UserModule();
		let fieldsParam;
		server.use(
			rest.get('http://localhost:3000/rest/data/User/find', (req, res, ctx) => {
				fieldsParam = req.url.searchParams.get('fields');
				return res.once(
					ctx.status(200),
					ctx.json({
						success: true,
						data: adminUserResponse.data.map(p => pick(p, ['_id', 'code', 'name'])),
						total: 2,
					}),
				);
			}),
		);

		// Act
		const user: User | null = await userModule.findOne(
			{
				match: 'and',
				conditions: [
					{
						term: 'username',
						operator: 'equals',
						value: 'admin',
					},
				],
			},
			{ fields: ['code', 'name'] },
		);

		// Assert
		expect(fieldsParam).to.be.equals('code,name');
		expect(user).to.not.be.null;
	});
});
