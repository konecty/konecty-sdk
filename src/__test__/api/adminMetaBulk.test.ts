import { KonectyClient } from '@konecty/sdk/Client';
import { expect } from 'chai';

import { rest } from 'msw';
import { server } from '../../__test__/setup-test';

/**
 * `applyMetaBulk` (POST /api/document) e `capabilities` em `createServiceAccount`.
 *
 * Paridade: `tests/test_meta_bulk.py` no `konecty-sdk-python` roda a mesma tabela, com a mesma
 * entrada e a mesma saída esperada; o nome `CASE` de cada teste é o mesmo nos dois arquivos.
 */

const ENDPOINT = 'http://localhost:3000';
const ITEM = { _id: 'Product', type: 'document', name: 'Product' };

const client = () => new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-admin-auth-id' });

describe('Konecty Admin Meta Bulk', () => {
	describe('applyMetaBulk', () => {
		// Python: tests/test_meta_bulk.py::test_dry_run_sends_only_given_options_and_returns_plan
		it('CASE dry-run: sends only items + dryRun and returns the route body', async () => {
			const plan = { created: ['Product'], updated: [], unchanged: 0, hooksRemoved: {} };
			const routeBody = { applied: 0, created: 0, updated: 0, deleted: 0, warnings: [], preservedHooks: {}, plan };
			let receivedUrl = '';
			let receivedAuthorization: string | null = null;
			let receivedBody: unknown = null;
			server.use(
				rest.post(`${ENDPOINT}/api/document`, async (req, res, ctx) => {
					receivedUrl = req.url.toString();
					receivedAuthorization = req.headers.get('Authorization');
					receivedBody = await req.json();
					return res.once(ctx.status(200), ctx.json(routeBody));
				}),
			);

			const result = await client().applyMetaBulk([ITEM], { dryRun: true });

			expect(receivedUrl).to.equal('http://localhost:3000/api/document');
			expect(receivedBody).to.deep.equal({ items: [ITEM], dryRun: true });
			expect(receivedAuthorization).to.equal('fake-admin-auth-id');
			expect(result).to.deep.equal({ success: true, data: routeBody });
		});

		// Python: tests/test_meta_bulk.py::test_dry_run_with_namespace_patch_returns_namespace_keys
		it('CASE dry-run-namespace: namespacePatch goes with dryRun and plan.namespace comes back', async () => {
			const patch = { metadataVersion: { cliente: 'auxiliadora', versaoCliente: 'v1.2.0' } };
			const plan = { created: [], updated: [], unchanged: 1, hooksRemoved: {}, namespace: { keys: ['metadataVersion'] } };
			let receivedBody: unknown = null;
			server.use(
				rest.post(`${ENDPOINT}/api/document`, async (req, res, ctx) => {
					receivedBody = await req.json();
					return res.once(ctx.status(200), ctx.json({ applied: 0, created: 0, updated: 0, deleted: 0, warnings: [], preservedHooks: {}, plan }));
				}),
			);

			const result = await client().applyMetaBulk([ITEM], { dryRun: true, namespacePatch: patch });

			expect(receivedBody).to.deep.equal({ items: [ITEM], dryRun: true, namespacePatch: patch });
			expect(result.success).to.equal(true);
			if (result.success) {
				const keys: string[] | undefined = result.data.plan?.namespace?.keys;
				expect(keys).to.deep.equal(['metadataVersion']);
			}
		});

		// Python: tests/test_meta_bulk.py::test_options_map_to_camel_case_body
		it('CASE options: deleteRemoved, hookMode and namespacePatch go in the body', async () => {
			const patch = { metadataVersion: { cliente: 'auxiliadora', versaoCliente: 'v1.2.0' } };
			let receivedBody: unknown = null;
			server.use(
				rest.post(`${ENDPOINT}/api/document`, async (req, res, ctx) => {
					receivedBody = await req.json();
					return res.once(ctx.status(200), ctx.json({ applied: 1, created: 0, updated: 1, deleted: 0, warnings: [], preservedHooks: {} }));
				}),
			);

			const result = await client().applyMetaBulk([ITEM], { deleteRemoved: false, hookMode: 'replace', namespacePatch: patch });

			expect(receivedBody).to.deep.equal({ items: [ITEM], deleteRemoved: false, hookMode: 'replace', namespacePatch: patch });
			expect(result.success).to.equal(true);
			if (result.success) {
				expect(result.data.updated).to.equal(1);
				expect(result.data).to.not.have.property('plan');
			}
		});

		// Python: tests/test_meta_bulk.py::test_400_errors_list_is_kept
		it('CASE 400-errors: keeps the errors list as is', async () => {
			const errors = [{ index: 0, path: 'name', message: 'Required' }];
			server.use(rest.post(`${ENDPOINT}/api/document`, (_req, res, ctx) => res.once(ctx.status(400), ctx.json({ errors }))));

			const result = await client().applyMetaBulk([ITEM]);

			expect(result).to.deep.equal({ success: false, status: 400, errors });
		});

		// Python: tests/test_meta_bulk.py::test_400_error_string_becomes_list
		it("CASE 400-error: {error: '...'} becomes [{message}]", async () => {
			server.use(rest.post(`${ENDPOINT}/api/document`, (_req, res, ctx) => res.once(ctx.status(400), ctx.json({ error: 'dryRun must be a boolean' }))));

			const result = await client().applyMetaBulk([ITEM]);

			expect(result).to.deep.equal({ success: false, status: 400, errors: [{ message: 'dryRun must be a boolean' }] });
		});

		// Python: tests/test_meta_bulk.py::test_403_plain_text
		it('CASE 403-text: plain-text Forbidden, with surrounding whitespace, becomes [{message}]', async () => {
			server.use(rest.post(`${ENDPOINT}/api/document`, (_req, res, ctx) => res.once(ctx.status(403), ctx.text('  Forbidden\n'))));

			const result = await client().applyMetaBulk([ITEM]);

			expect(result).to.deep.equal({ success: false, status: 403, errors: [{ message: 'Forbidden' }] });
		});

		// Python: tests/test_meta_bulk.py::test_413_fastify_body_keeps_message_and_code
		it('CASE 413-fastify: keeps message and code from the Fastify body', async () => {
			server.use(
				rest.post(`${ENDPOINT}/api/document`, (_req, res, ctx) =>
					res.once(
						ctx.status(413),
						ctx.json({ statusCode: 413, code: 'FST_ERR_CTP_BODY_TOO_LARGE', error: 'Payload Too Large', message: 'Request body is too large' }),
					),
				),
			);

			const result = await client().applyMetaBulk([ITEM]);

			expect(result).to.deep.equal({
				success: false,
				status: 413,
				errors: [{ message: 'Request body is too large', code: 'FST_ERR_CTP_BODY_TOO_LARGE' }],
			});
		});

		// Python: tests/test_meta_bulk.py::test_500_plain_text_is_a_konecty_api_error
		it('CASE 500-text: plain-text 5xx becomes [{message}]', async () => {
			server.use(rest.post(`${ENDPOINT}/api/document`, (_req, res, ctx) => res.once(ctx.status(500), ctx.text('Internal server error'))));

			const result = await client().applyMetaBulk([ITEM]);

			expect(result).to.deep.equal({ success: false, status: 500, errors: [{ message: 'Internal server error' }] });
		});

		// Python: tests/test_meta_bulk.py::test_empty_error_body_uses_status
		it('CASE empty: with no body the message is the status', async () => {
			server.use(rest.post(`${ENDPOINT}/api/document`, (_req, res, ctx) => res.once(ctx.status(502), ctx.text(''))));

			const result = await client().applyMetaBulk([ITEM]);

			expect(result).to.deep.equal({ success: false, status: 502, errors: [{ message: '502' }] });
		});
	});

	describe('applyMetaBulk without a usable answer', () => {
		// Python: tests/test_meta_bulk.py::test_401_plain_text
		it('CASE 401-text: plain-text Unauthorized becomes [{message}]', async () => {
			server.use(rest.post(`${ENDPOINT}/api/document`, (_req, res, ctx) => res.once(ctx.status(401), ctx.text('Unauthorized'))));

			const result = await client().applyMetaBulk([ITEM]);

			expect(result).to.deep.equal({ success: false, status: 401, errors: [{ message: 'Unauthorized' }] });
		});

		// Python: tests/test_meta_bulk.py::test_network_error_has_status_zero
		it('CASE network: no answer at all gives status 0 and a message', async () => {
			server.use(rest.post(`${ENDPOINT}/api/document`, (_req, res) => res.networkError('connection refused')));

			const result = await client().applyMetaBulk([ITEM]);

			expect(result.success).to.equal(false);
			if (!result.success) {
				expect(result.status).to.equal(0);
				expect(result.errors[0].message).to.not.equal('');
			}
		});
	});

	describe('createServiceAccount capabilities', () => {
		const created = { success: true, data: { _id: 'sa-1', username: 'metas-aux', role: { _id: 'r', name: 'r' }, access: {} } };

		// Python: tests/test_meta_bulk.py::test_create_service_account_sends_capabilities
		it('CASE sa-capabilities: sends capabilities when given', async () => {
			let receivedBody: unknown = null;
			server.use(
				rest.post(`${ENDPOINT}/api/admin/service-accounts`, async (req, res, ctx) => {
					receivedBody = await req.json();
					return res.once(ctx.status(201), ctx.json(created));
				}),
			);

			await client().createServiceAccount('Metas Aux', 'metas-aux', undefined, { capabilities: ['metaApply'] });

			expect(receivedBody).to.deep.equal({ name: 'Metas Aux', username: 'metas-aux', capabilities: ['metaApply'] });
		});

		// Python: tests/test_meta_bulk.py::test_create_service_account_omits_capabilities_when_not_given
		it('CASE sa-no-capabilities: leaves capabilities out when not given', async () => {
			let receivedBody: Record<string, unknown> = {};
			server.use(
				rest.post(`${ENDPOINT}/api/admin/service-accounts`, async (req, res, ctx) => {
					receivedBody = await req.json();
					return res.once(ctx.status(201), ctx.json(created));
				}),
			);

			await client().createServiceAccount('X', 'x');

			expect(receivedBody).to.not.have.property('capabilities');
		});
	});
});
