import chalk from 'chalk';
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import docCommand, { CreateDocOptions } from './docCommand';
import typeCommand, { CreateInterfaceOptions } from './typeCommand';

export default function createProgram(): Command {
	const __dirname = path.dirname(__filename);

	const { version } = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', 'package.json'), 'utf-8'));

	const program = new Command();

	program.version(version);

	program.name('konecty');

	function runCommand(option: string, input: string, options: { [key: string]: string }): void {
		switch (option) {
			case 'doc':
				const docOptions: CreateDocOptions = Object.assign({}, options, { input }) as CreateDocOptions;
				return docCommand(docOptions);
			case 'class':
				const typeOtions: CreateInterfaceOptions = Object.assign({}, options, { input }) as CreateInterfaceOptions;
				return typeCommand(typeOtions);
			default:
				return console.error(chalk.red(`Unknown command ${option}`));
		}
	}

	program
		.command('create <option> <input>')
		.description('Create a new type from a metadata file')
		.option('-o, --output <input>', 'Output type file')
		.action(runCommand);

	return program;
}
