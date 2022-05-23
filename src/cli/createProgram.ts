import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import typeCommand from './typeCommand';

export default function createProgram(): Command {
	const { version } = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf-8'));
	const program = new Command();

	program.version(version);

	program.name('konecty');

	program
		.command('create class')
		.description('Create a new type from a metadata file')
		.option('-i, --input <input>', 'Input metadata file')
		.option('-o, --output <input>', 'Output type file')
		.action(typeCommand);
	return program;
}
