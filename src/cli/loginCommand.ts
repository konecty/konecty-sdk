import chalk from 'chalk';
import fs from 'fs';
import ini from 'ini';
import inquirer from 'inquirer';
import mkdirp from 'mkdirp';
import os from 'os';
import path from 'path';
import { KonectyClient } from '../sdk/Client';

export interface LoginCommandOptions {
	host?: string;
	user?: string;
	password?: string;
	output?: string;
}

export default async function loginCommand(options?: LoginCommandOptions): Promise<void> {
	const questions = [];
	const localOptions = Object.assign({}, options ?? {});

	if (localOptions?.host == null) {
		questions.push({
			type: 'input',
			name: 'host',
			message: 'Please inform Konecty Host:',
			default: 'http://localhost:3000',
		});
	}
	if (localOptions?.user == null) {
		questions.push({
			type: 'input',
			name: 'user',
			message: 'User name:',
		});
	}
	if (localOptions?.password == null) {
		questions.push({
			type: 'password',
			name: 'password',
			message: 'Password:',
		});
	}

	if (questions.length > 0) {
		const answers = await inquirer.prompt(questions);

		Object.assign(localOptions, answers);
	}

	const { host, user, password } = localOptions;

	if ([host, user, password].some(x => x == null || /^\s*$/.test(x))) {
		console.error(chalk.red('Missing required parameters (host, user, password)'));
		return;
	}

	const client = new KonectyClient({ endpoint: host });
	const { success, errors, authId, user: konectyUser } = await client.login(user ?? '', password ?? '');

	if (success === false) {
		console.error(chalk.red(`Login failed:\n ${(errors ?? []).join('\n')}`));
		return;
	}

	const __dirname = localOptions?.output != null ? pathResolve(process.env.INIT_CWD ?? './') : getHomeDir();

	if (__dirname == null) {
		console.error(chalk.red('Unable to get current or home directory'));
		return;
	}

	await mkdirp(__dirname);

	const outputFile = pathResolve(__dirname, localOptions?.output ?? 'credentials');

	let originalFile = '';
	try {
		statSync(outputFile);
		originalFile = readFileSync(outputFile);
	} catch (_) {}

	const outputIni = ini.parse(originalFile);

	if (outputIni.default == null) {
		outputIni.default = {
			host: host,
			userId: konectyUser?._id,
			authId,
		};
	}

	outputIni[host ?? ''] = {
		host: host,
		userId: konectyUser?._id,
		authId,
	};

	writeFileSync(outputFile, ini.stringify(outputIni));

	console.log(chalk.green(`Authentication data successful stored in ${outputFile}!`));
}

// Test mocks

function getHomeDir(): string | null {
	if (process.env.NODE_ENV === 'test') {
		return '/dev/null';
	}
	const home =
		process.env.HOME ||
		process.env.USERPROFILE ||
		(process.env.HOMEPATH ? (process.env.HOMEDRIVE || 'C:/') + process.env.HOMEPATH : null);

	if (home != null) {
		return pathResolve(home, '.konecty');
	}

	if (typeof os.homedir === 'function') {
		return pathResolve(os.homedir(), '.konecty');
	}

	return null;
}

function writeFileSync(path: string, data: string) {
	if (process.env.NODE_ENV === 'test') {
		return;
	}
	return fs.writeFileSync(path, data, 'utf-8');
}
function statSync(path: string) {
	if (process.env.NODE_ENV === 'test') {
		return { isFile: () => true };
	}
	return fs.statSync(path);
}
function pathResolve(...paths: string[]): string {
	if (process.env.NODE_ENV === 'test') {
		return paths.join('/');
	}

	return path.resolve(...paths);
}

function readFileSync(path: string) {
	if (process.env.NODE_ENV === 'test') {
		return '';
	}
	return fs.readFileSync(path, 'utf-8');
}
