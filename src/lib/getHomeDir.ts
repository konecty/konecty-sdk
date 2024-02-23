import os from 'os';
import { getEnvVariable } from './getEnv';

export default function getHomeDir(): string | null {
	const home =
		getEnvVariable('HOME') ||
		getEnvVariable('USERPROFILE') ||
		(getEnvVariable('HOMEPATH') ? (getEnvVariable('HOMEDRIVE') || 'C:/') + getEnvVariable('HOMEPATH') : null);

	if (home != null) {
		return home;
	}

	if (typeof os.homedir === 'function') {
		return os.homedir();
	}

	return null;
}
