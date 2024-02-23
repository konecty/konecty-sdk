import { MetadataDocument } from '@konecty/sdk/types/metadata';
import chalk from 'chalk';
import fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';
import { createTypeFromMetadata } from '../lib/createTypeFromMetadata';
import { getEnvVariable } from '../lib/getEnv';

export type CreateInterfaceOptions = {
	input: string;
	output: string;
};

export default function ({ input, output }: CreateInterfaceOptions): void {
	const __dirname = path.resolve(getEnvVariable('INIT_CWD') ?? './');
	const inputFile = path.resolve(__dirname, input);

	try {
		fs.statSync(inputFile);
	} catch (error) {
		console.error(chalk.red(`File ${inputFile} not found`));
		return;
	}

	try {
		const metadata: MetadataDocument = JSON.parse(fs.readFileSync(inputFile, 'utf-8')) as MetadataDocument;
		const outputFile = path.resolve(__dirname, output ?? './', `./${metadata.name}.ts`);
		const outputDir = path.dirname(outputFile);
		mkdirp.sync(outputDir);

		const type = createTypeFromMetadata(metadata);

		fs.writeFileSync(outputFile, type);
	} catch (error) {
		console.error(chalk.red(error));
		if (error instanceof SyntaxError) {
			return console.error(chalk.red(`File ${inputFile} is not a valid JSON file`));
		}
	}
}
