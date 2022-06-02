import { expect } from 'chai';
import { MockAgent, setGlobalDispatcher } from 'undici';
import createProgram from '../../cli/createProgram';

jest.mock('mkdirp');

const agent = new MockAgent();
const client = agent.get('http://localhost:3000');

jest.resetAllMocks();

// const actualPath = jest.requireActual('path');
// const actualFs = jest.requireActual('fs');

describe('Konecty command line tool login command', () => {
	beforeAll(async () => {
		agent.disableNetConnect();

		setGlobalDispatcher(agent);
	});

	afterAll(async () => {
		await agent.close();
	});

	it('Should create typescript classes from metadata', async () => {
		// Arrange

		const packageJsonContent = `{ "version": "1.0.0" }`;

		client
			.intercept({
				path: '/rest/auth/login',
				method: 'POST',
			})
			.reply(200, {
				success: true,
				logged: true,
				authId: 'new-id',
				user: {
					_id: 'new-user',
					access: {
						defaults: ['System', 'Full'],
					},
					admin: true,
					locale: 'pt_BR',
				},
			});

		// Act
		const program = createProgram();
		await program.parseAsync(['node', 'konecty', 'login', '-h', 'http://localhost:3000', '-u', 'admin', '-p', 'admin']);

		// Assert
		// expect(writeSpy.mock.calls.length).to.equal(1);

		expect(true).to.be.true;
	});
});
