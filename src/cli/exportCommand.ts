import BluebirdPromise from 'bluebird';
import chalk from 'chalk';
import { writeFileSync } from 'fs';
import inquirer from 'inquirer';
import get from 'lodash/get';
import mkdirp from 'mkdirp';
import path from 'path';
import { KonectyClient } from '../sdk/Client';

export interface ExportCommandOptions {
	credentialsFile?: string;
	profile?: string;
	output?: string;
}

export default async function exportCommand(document?: string, options?: ExportCommandOptions): Promise<void> {
	const localOptions = Object.assign({}, options ?? {});

	const outputDir = path.resolve(process.env.INIT_CWD ?? './');

	let client = await KonectyClient.fromConfigFile({
		credentialsFile: localOptions.credentialsFile,
		endpoint: localOptions.profile,
	});

	if (client.options.accessKey == null) {
		const { host, user, password } = await inquirer.prompt([
			{
				type: 'input',
				name: 'host',
				message: 'Please inform Konecty Host:',
				default: 'http://localhost:3000',
			},
			{
				type: 'input',
				name: 'user',
				message: 'User name:',
			},
			{
				type: 'password',
				name: 'password',
				message: 'Password:',
			},
		]);

		if ([host, user, password].some(x => x == null || /^\s*$/.test(x))) {
			console.error(chalk.red('Missing required parameters (host, user, password)'));
			return;
		}
		client = new KonectyClient({ endpoint: host });
		const { success, errors } = await client.login(user ?? '', password ?? '');
		if (success === false) {
			console.error(chalk.red(`Login failed:\n ${(errors ?? []).join('\n')}`));
			return;
		}
	}

	const processDoc = async (docName: string) => {
		const { success, errors, data } = await client.getDocument(docName);
		if (success === false) {
			console.error(chalk.red(`Get document ${docName} failed:\n ${(errors ?? []).join('\n')}`));
			return;
		}

		const outputFile = path.resolve(outputDir, `${docName}.json`);

		const fields = (get(data, 'fields', []) as Array<object>).reduce(
			(acc, field) => Object.assign(acc, { [get(field, 'name')]: field }),
			{},
		);

		await mkdirp(path.dirname(outputFile));

		writeFileSync(outputFile, JSON.stringify(Object.assign(data ?? {}, { fields }), null, 2));
	};

	if (document != null) {
		await processDoc(document);
	} else {
		const { success, errors, data } = await client.getDocuments();

		if (success === false) {
			console.error(chalk.red(`Get documents failed:\n ${(errors ?? []).join('\n')}`));
			return;
		}

		const availableDocuments = (data ?? []).map<string>(doc => get(doc, 'name')).sort();

		const { document } = await inquirer.prompt({
			type: 'list',
			name: 'document',
			message: 'Select a document:',
			choices: [{ name: 'All', value: 'all' }].concat(availableDocuments.map(docName => ({ name: docName, value: docName }))),
		});

		if (document === 'all') {
			await BluebirdPromise.mapSeries(availableDocuments, processDoc);
		} else {
			await processDoc(document);
		}
	}
	return;
}
