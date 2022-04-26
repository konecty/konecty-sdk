import { FastifyPluginCallback, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

const hello: FastifyPluginCallback = async (fastify, _, done) => {
	fastify.get('/hello', helloRoute);
	done();
};

function helloRoute(_: FastifyRequest, reply: FastifyReply) {
	reply.send({ hello: 'world' });
}

export default fp(hello, {
	fastify: '^3.0.0',
	name: 'hello-routes',
});
