import chalk from 'chalk';
import fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';
import { createDocFromMetadata } from '../lib/createDocFromMetadata';
import { getEnvVariable } from '../lib/getEnv';

export type CreateDocOptions = {
	input: string;
	output: string;
};

export default function ({ input, output }: CreateDocOptions): void {
	const __dirname = path.resolve(getEnvVariable('INIT_CWD') ?? './');

	const inputFile = path.resolve(__dirname, input);

	try {
		fs.statSync(inputFile);
	} catch (error) {
		console.error(chalk.red(`File ${inputFile} not found`));
		return;
	}

	try {
		const metadataFileContent = fs.readFileSync(inputFile, 'utf-8');
		const metadata = JSON.parse(metadataFileContent);
		const outputFile = path.resolve(__dirname, output ?? `./${metadata.name}.md`);
		const outputDir = path.dirname(outputFile);
		mkdirp.sync(outputDir);

		const result = createDocFromMetadata(metadata);

		fs.writeFileSync(outputFile, result);
	} catch (error) {
		if (error instanceof SyntaxError) {
			return console.error(chalk.red(`File ${inputFile} is not a valid JSON file`));
		}
		console.error(chalk.red(error));
	}
}
