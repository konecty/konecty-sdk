import os from 'os';
import path from 'path';

export default function getHomeDir(): string | null {
	const home =
		process.env.HOME ||
		process.env.USERPROFILE ||
		(process.env.HOMEPATH ? (process.env.HOMEDRIVE || 'C:/') + process.env.HOMEPATH : null);

	if (home != null) {
		return path.resolve(home, '.konecty');
	}

	if (typeof os.homedir === 'function') {
		return path.resolve(os.homedir(), '.konecty');
	}

	return null;
}
