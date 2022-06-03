import { KonectyClient } from '@konecty/sdk/Client';
import { expect } from 'chai';
import { User, UserModule } from '../fixtures/types/User';

describe('Konecty modules should validate docment', () => {
	beforeAll(async () => {
		KonectyClient.defaults.endpoint = 'http://localhost:3000';
		KonectyClient.defaults.accessKey = 'fake-key';
	});

	it('Should resonse missing required fields for document', async () => {
		// Arrange
		const userModule = new UserModule();
		const expectErrors = {
			required: {
				active: { en: 'Active', pt_BR: 'Ativo' },
				group: { en: 'Group', pt_BR: 'Grupo' },
				locale: { en: 'Locale', pt_BR: 'Opções Regionais' },
				role: { en: 'Role', pt_BR: 'Papel' },
				temporaryBadge: { en: 'Temporary Badge', pt_BR: 'Crachá Provisório' },
				username: { en: 'Login', pt_BR: 'Login' },
			},
		};

		const newUser: User = {
			name: 'Foo',
		};

		const { success, errors } = userModule.validate(newUser);

		expect(success).to.be.false;
		expect(errors).to.be.deep.equal(expectErrors);
	});

	it('Should return success for complete user object', async () => {
		// Arrange
		const userModule = new UserModule();
		const newUser: User = {
			name: 'Foo',
			active: true,
			username: 'foo',
			role: { _id: 'role-id', name: 'admin' },
			temporaryBadge: false,
			locale: 'pt_BR',
			group: {
				_id: 'group-id',
				name: 'Foo',
			},
		};

		// Act
		const { success } = userModule.validate(newUser);

		// Assert
		expect(success).to.be.true;
	});
});
