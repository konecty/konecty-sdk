import { expect } from 'chai';
import fs, { Stats } from 'fs';
import path from 'path';

import { rest } from 'msw';
import { server } from '../../__test__/setup-test';

import createProgram from '../../cli/createProgram';

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

		process.env.HOME = '/dev/null';

		mockedFs.readFileSync.mockReturnValueOnce(packageJsonContent).mockReturnValueOnce(``).mockReturnValueOnce(``);

		mockedFs.statSync.mockReturnValueOnce({ isFile: () => true } as Stats);

		mocketPath.resolve
			.mockReturnValueOnce('/dev/null')
			.mockReturnValueOnce('/dev/null')
			.mockReturnValueOnce('/dev/null/.konecty')
			.mockReturnValueOnce('/dev/null/.konecty/credentials')
			.mockReturnValueOnce('/dev/null')
			.mockReturnValueOnce('/dev/null/.konecty')
			.mockReturnValueOnce('/dev/null/.konecty/credentials');

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

		// Act
		const program = createProgram();
		await program.parseAsync(['node', 'konecty', 'login', '-h', 'http://localhost:3000', '-u', 'admin', '-p', 'admin']);

		// Assert
		expect(mockedFs.writeFileSync.mock.calls.length).to.equal(1);
	});
});
