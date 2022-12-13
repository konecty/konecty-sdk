import fs from 'fs';
import ini from 'ini';
import get from 'lodash/get';
import path from 'path';

import { KonectyClient, KonectyClientOptions } from '../sdk/Client';
import getHomeDir from './getHomeDir';

function loadCredentialsFromFile(options?: KonectyClientOptions): KonectyClientOptions | undefined {
	try {
		const __dirname = path.resolve(process.env.INIT_CWD ?? './');
		const credentialsFile = options?.credentialsFile ?? path.resolve(getHomeDir() ?? '', '.konecty', 'credentials');

		const resolvedFilePath = /^\~/.test(credentialsFile)
			? path.resolve(credentialsFile.replace(/^\~/, getHomeDir() || ''))
			: path.resolve(__dirname, credentialsFile);

		const credentialsContent = fs.readFileSync(path.resolve(resolvedFilePath), 'utf8');

		const credentials = ini.parse(credentialsContent);

		if (credentials != null) {
			if (get(options, 'endpoint') != null && get(credentials, get(options, 'endpoint', '')) != null) {
				const hostCredentials = get(credentials, get(options, 'endpoint', ''));
				return {
					...KonectyClient.defaults,
					endpoint: get(hostCredentials, 'host'),
					accessKey: get(hostCredentials, 'authId'),
				};
			} else if (get(credentials, 'default') != null) {
				const defaultCredentials = get(credentials, get(options, 'endpoint', ''));
				return {
					...KonectyClient.defaults,
					endpoint: get(defaultCredentials, 'host'),
					accessKey: get(defaultCredentials, 'authId'),
				};
			}
		}
	} catch (error) {
		console.error(error);
	}
	return options;
}

export default loadCredentialsFromFile;
