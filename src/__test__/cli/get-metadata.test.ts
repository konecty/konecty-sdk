import { expect } from 'chai';
import fs from 'fs';
import path from 'path';

import { rest } from 'msw';
import { server } from '../../__test__/setup-test';

import createProgram from '../../cli/createProgram';
import AccessFailedLogResponse from '../fixtures/konecty/get-document-AccessFailedLog.json';
import AccessFailedLogOutput from '../fixtures/MetaObjects/AccessFailedLog.json';

jest.mock('fs');
jest.mock('mkdirp');
jest.mock('path');

const mockedFs = fs as jest.Mocked<typeof fs>;
const mocketPath = path as jest.Mocked<typeof path>;

describe('Konecty command line tool login command', () => {
	beforeAll(async () => {
		jest.resetAllMocks();
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

		server.use(
			rest.post('http://localhost:3000/rest/auth/login', (req, res, ctx) => {
				return res.once(
					ctx.status(200),
					ctx.json({
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
					}),
				);
			}),
		);

		server.use(
			rest.get('http://localhost:3000/rest/menu/documents/AccessFailedLog', (req, res, ctx) => {
				return res.once(ctx.status(200), ctx.json(AccessFailedLogResponse));
			}),
		);

		// Act
		const program = createProgram();
		await program.parseAsync(['node', 'konecty', 'export', 'AccessFailedLog']);

		// Assert
		expect(mockedFs.writeFileSync.mock.calls.length).to.equal(1);
		expect(mockedFs.writeFileSync.mock.calls[0][1]).to.equal(JSON.stringify(AccessFailedLogOutput, null, 2));
	});
});
