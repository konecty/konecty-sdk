import fastify from 'fastify';
import logger from './lib/logger';
import hello from './routes/hello';
import liveness from './routes/liveness';

function createServer() {
	const server = fastify({
		logger,
	});

	server.register(hello);
	server.register(liveness);

	return server;
}

export default createServer;
