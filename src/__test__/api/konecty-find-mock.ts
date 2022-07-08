import { MockAgent } from 'undici';
import activeUserResponse from '../fixtures/konecty/find-active-users.json';
import adminUserResponse from '../fixtures/konecty/find-admin-user.json';
import findNoResults from '../fixtures/konecty/find-no-results.json';

const agent = new MockAgent();
agent.disableNetConnect();

const client = agent.get('http://localhost:3000');
client
	.intercept({
		path: path => /^\/rest\/data\/User\/find\?.+limit=1.?/.test(path),
		method: 'GET',
	})
	.reply(200, adminUserResponse);

client
	.intercept({
		path: path => /^\/rest\/data\/User\/find\?.+limit=50.?/.test(path),
		method: 'GET',
		query: {
			limit: 50,
		},
	})
	.reply(200, activeUserResponse);

client
	.intercept({
		path: path => /^\/rest\/data\/Campaign\/find\?.+limit=1.?/.test(path),
		method: 'GET',
	})
	.reply(200, findNoResults);

export default agent;
