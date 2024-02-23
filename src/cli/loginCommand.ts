import chalk from 'chalk';
import fs from 'fs';
import ini from 'ini';
import inquirer from 'inquirer';
import mkdirp from 'mkdirp';
import path from 'path';
import { getEnvVariable } from '../lib/getEnv';
import getHomeDir from '../lib/getHomeDir';
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

	const __dirname =
		localOptions?.output != null ? path.resolve(getEnvVariable('INIT_CWD') ?? './') : path.resolve(getHomeDir() ?? '', '.konecty');

	if (__dirname == null) {
		console.error(chalk.red('Unable to get current or home directory'));
		return;
	}

	await mkdirp(__dirname);

	const outputFile = path.resolve(__dirname, localOptions?.output ?? 'credentials');

	let originalFile = '';
	try {
		fs.statSync(outputFile);
		originalFile = fs.readFileSync(outputFile, 'utf-8');
	} catch (_) { }

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

	fs.writeFileSync(outputFile, ini.stringify(outputIni), 'utf-8');

	console.log(chalk.green(`Authentication data successful stored in ${outputFile}!`));
}
