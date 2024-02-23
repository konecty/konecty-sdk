import pino from 'pino';
import { getEnvVariable } from './getEnv';

const logger = pino({
	level: getEnvVariable('LOG_LEVEL') ?? 'info',
});

export default logger;
