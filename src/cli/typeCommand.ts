import chalk from 'chalk';
import fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';
import { createTypeFromMetadata } from '../lib/createTypeFromMetadata';

export type CreateInterfaceOptions = {
	input: string;
	output: string;
};

export default function ({ input, output }: CreateInterfaceOptions): void {
	const __dirname = path.resolve();
	const inputFile = path.resolve(__dirname, input);

	try {
		fs.statSync(inputFile);
	} catch (error) {
		console.error(chalk.red(`File ${inputFile} not found`));
		return;
	}

	try {
		const metadata = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
		const outputFile = path.resolve(__dirname, output ?? `./${metadata.name}.ts`);
		const outputDir = path.dirname(outputFile);
		mkdirp.sync(outputDir);

		const type = createTypeFromMetadata(metadata);

		fs.writeFileSync(outputFile, type);
	} catch (error) {
		if (error instanceof SyntaxError) {
			return console.error(chalk.red(`File ${inputFile} is not a valid JSON file`));
		}
		console.error(chalk.red(error));
	}
}
