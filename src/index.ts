import app from './app';

const server = app();

server.listen(3000, (err, address) => {
	if (err) {
		console.error(err);
		process.exit(1);
	}
	console.log(`server listening on ${address}`);
});
