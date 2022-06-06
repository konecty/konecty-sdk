import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import { MockAgent, setGlobalDispatcher } from 'undici';
import createProgram from '../../cli/createProgram';
import AccessFailedLogResponse from '../fixtures/konecty/get-document-AccessFailedLog.json';
import AccessFailedLogOutput from '../fixtures/MetaObjects/AccessFailedLog.json';

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

		mockedFs.readFileSync
			.mockReturnValueOnce(packageJsonContent)
			.mockReturnValueOnce('[default]\nhost=http://localhost:3000\nuserId=new-user\nauthId=new-id');

		mocketPath.resolve
			.mockReturnValueOnce('/dev/null/.konecty')
			.mockReturnValueOnce('/dev/null/.konecty/credentials')
			.mockReturnValueOnce('/dev/null/')
			.mockReturnValueOnce('/dev/null/AccessFailedLog.log');

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
		client
			.intercept({
				path: '/rest/menu/documents/AccessFailedLog',
				method: 'GET',
			})
			.reply(200, AccessFailedLogResponse);

		// Act
		const program = createProgram();
		await program.parseAsync(['node', 'konecty', 'export', 'AccessFailedLog']);

		// Assert
		expect(mockedFs.writeFileSync.mock.calls.length).to.equal(1);
		expect(mockedFs.writeFileSync.mock.calls[0][1]).to.equal(JSON.stringify(AccessFailedLogOutput, null, 2));
	});
});
