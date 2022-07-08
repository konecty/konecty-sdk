import { KonectyClient } from '@konecty/sdk/Client';
import { expect } from 'chai';
import { setGlobalDispatcher } from 'undici';
import { Campaign, CampaignModule } from '../fixtures/types/Campaign';
import { User, UserModule } from '../fixtures/types/User';
import KonectyFindMockAgent from './konecty-find-mock';

describe('Konecty Retrive Documents', () => {
	beforeAll(async () => {
		setGlobalDispatcher(KonectyFindMockAgent);
		KonectyClient.defaults.endpoint = 'http://localhost:3000';
		KonectyClient.defaults.accessKey = 'fake-key';
	});
	it('Should retrieve admin user from username from a collection', async () => {
		// Arrange
		const userModule = new UserModule();

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
});
