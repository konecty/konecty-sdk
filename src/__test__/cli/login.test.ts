import { expect } from 'chai';
import fs, { Stats } from 'fs';
import path from 'path';
import { MockAgent, setGlobalDispatcher } from 'undici';
import createProgram from '../../cli/createProgram';

jest.mock('fs');
jest.mock('mkdirp');
jest.mock('path');

const agent = new MockAgent();
const client = agent.get('http://localhost:3000');

const mockedFs = fs as jest.Mocked<typeof fs>;
const mocketPath = path as jest.Mocked<typeof path>;

// const actualPath = jest.requireActual('path');
// const actualFs = jest.requireActual('fs');

describe('Konecty command line tool login command', () => {
	beforeAll(async () => {
		jest.resetAllMocks();
		agent.disableNetConnect();

		setGlobalDispatcher(agent);
	});

	afterAll(async () => {
		await agent.close();
	});

	it('Should create typescript classes from metadata', async () => {
		// Arrange
		jest.spyOn(mockedFs, 'writeFileSync');

		const packageJsonContent = `{ "version": "1.0.0" }`;

		process.env.HOME = '/dev/null';

		mockedFs.readFileSync.mockReturnValueOnce(packageJsonContent).mockReturnValueOnce(``);

		mockedFs.statSync.mockReturnValueOnce({ isFile: () => true } as Stats);

		mocketPath.resolve.mockReturnValueOnce('/dev/null/.konecty').mockReturnValueOnce('/dev/null/.konecty/credentials');

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
		expect(mockedFs.writeFileSync.mock.calls.length).to.equal(1);
	});
});
