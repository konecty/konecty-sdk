import { FastifyPluginCallback } from 'fastify';
import fp from 'fastify-plugin';

const liveness: FastifyPluginCallback = async (fastify, _, done) => {
	fastify.get('/liveness', async (_, reply) => {
		//TODO: implement liveness check
		reply.send({
			status: 'ok',
		});
	});
	done();
};

export default fp(liveness, {
	fastify: '^3.0.0',
	name: 'liveness',
});
