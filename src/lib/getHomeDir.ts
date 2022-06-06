import os from 'os';

export default function getHomeDir(): string | null {
	const home =
		process.env.HOME ||
		process.env.USERPROFILE ||
		(process.env.HOMEPATH ? (process.env.HOMEDRIVE || 'C:/') + process.env.HOMEPATH : null);

	if (home != null) {
		return home;
	}

	if (typeof os.homedir === 'function') {
		return os.homedir();
	}

	return null;
}
