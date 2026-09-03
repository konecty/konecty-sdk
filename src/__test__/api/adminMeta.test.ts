import { KonectyClient } from '@konecty/sdk/Client';
import { expect } from 'chai';

import { rest } from 'msw';
import { server } from '../../__test__/setup-test';

const ENDPOINT = 'http://localhost:3000';

/**
 * Fatia mínima da Meta Admin API (`/api/admin/meta`).
 *
 * Cada teste cita o equivalente em `tests/test_admin.py` do `konecty-sdk-python`: os dois SDKs são
 * pares, e a paridade é travada por teste com **a mesma entrada e a mesma saída esperada** — não por
 * comentário dizendo "igual ao outro". As divergências reais que já morderam este time foram
 * codificação de query string e código de erro presente num SDK e ausente no outro, e é exatamente
 * o que os testes de URL e de `409`/`403` abaixo fixam.
 */
/**
 * Vetor de codificação compartilhado com o SDK Python. As mesmas 8 entradas são asseveradas em
 * `tests/test_admin.py::test_path_segment_encoding_matches_the_typescript_sdk`, com as mesmas
 * saídas — é o que trava a paridade byte a byte da URL, que é onde a divergência entre os dois SDKs
 * já aconteceu de verdade.
 */
const SEGMENT_ENCODING_CASES: Array<[string, string]> = [
	['Contact:list:Default', 'Contact:list:Default'],
	['My Doc', 'My%20Doc'],
	// `/` SEMPRE codificado: cru, quebraria o path em dois segmentos.
	['a/b', 'a%2Fb'],
	// `+` SEMPRE codificado: cru num path, servidor leniente pode lê-lo como espaço.
	['a+b', 'a%2Bb'],
	['{"$ne":null}', '%7B%22$ne%22:null%7D'],
	['a&b', 'a&b'],
	['a@b', 'a@b'],
	['ç', '%C3%A7'],
];

describe('Konecty Admin Meta', () => {
	describe('path segment encoding', () => {
		// Equivalent Python test: tests/test_admin.py::test_path_segment_encoding_matches_the_typescript_sdk
		it('Should produce the same bytes the Python SDK puts on the wire', async () => {
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-admin-auth-id' });
			const seen: string[] = [];

			server.use(
				rest.get(`${ENDPOINT}/api/admin/meta/:document`, (req, res, ctx) => {
					seen.push(req.url.pathname.replace('/api/admin/meta/', ''));
					return res(ctx.status(200), ctx.json({ success: true, data: {} }));
				}),
			);

			for (const [input] of SEGMENT_ENCODING_CASES) {
				await konecty.readMeta(input);
			}

			// `req.url.pathname` do msw devolve o caminho como veio na requisição.
			expect(seen).to.deep.equal(SEGMENT_ENCODING_CASES.map(([, encoded]) => encoded));
		});
	});

	describe('listMetaDocuments', () => {
		// Equivalent Python test: tests/test_admin.py::test_list_meta_documents_gets_the_meta_collection
		it('Should GET /api/admin/meta', async () => {
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-admin-auth-id' });
			let receivedUrl = '';
			let receivedAuth = '';

			server.use(
				rest.get(`${ENDPOINT}/api/admin/meta`, (req, res, ctx) => {
					receivedUrl = req.url.toString();
					receivedAuth = req.headers.get('authorization') ?? '';
					return res(ctx.status(200), ctx.json({ success: true, data: [{ _id: 'Contact', name: 'Contact', type: 'document' }] }));
				}),
			);

			const result = await konecty.listMetaDocuments();

			expect(receivedUrl).to.equal(`${ENDPOINT}/api/admin/meta`);
			expect(receivedAuth).to.equal('fake-admin-auth-id');
			expect(result.success).to.equal(true);
			expect(result.success === true && result.data[0]._id).to.equal('Contact');
		});
	});

	describe('readMeta', () => {
		// Equivalent Python test: tests/test_admin.py::test_read_meta_encodes_the_document_segment
		it('Should GET /api/admin/meta/:document with the segment percent-encoded', async () => {
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-admin-auth-id' });
			let receivedUrl = '';

			server.use(
				rest.get(`${ENDPOINT}/api/admin/meta/:document`, (req, res, ctx) => {
					receivedUrl = req.url.toString();
					return res(ctx.status(200), ctx.json({ success: true, data: { _id: 'My Doc', type: 'document' } }));
				}),
			);

			await konecty.readMeta('My Doc');

			// `%20`, nunca `+`: o Python usa `quote(segment, safe='')` pela mesma razão. Com
			// `quote_plus` as duas URLs deixariam de bater byte a byte — divergência que já aconteceu.
			expect(receivedUrl).to.equal(`${ENDPOINT}/api/admin/meta/My%20Doc`);
		});

		// Equivalent Python test: tests/test_admin.py::test_read_meta_returns_not_found_envelope
		it('Should surface the 404 envelope for a meta that does not exist', async () => {
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-admin-auth-id' });

			server.use(
				rest.get(`${ENDPOINT}/api/admin/meta/:document`, (req, res, ctx) =>
					res(ctx.status(404), ctx.json({ success: false, errors: [{ message: 'Meta not found' }] })),
				),
			);

			const result = await konecty.readMeta('Ghost');

			expect(result.success).to.equal(false);
			expect(result.success === false && result.errors[0].message).to.equal('Meta not found');
		});
	});

	describe('upsertMeta', () => {
		// Equivalent Python test: tests/test_admin.py::test_upsert_meta_puts_the_body_and_reports_the_version
		it('Should PUT /api/admin/meta/:document/:type with the body and report the version', async () => {
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-admin-auth-id' });
			let receivedUrl = '';
			let receivedMethod = '';
			let receivedBody: unknown = null;

			server.use(
				rest.put(`${ENDPOINT}/api/admin/meta/:document/:type`, async (req, res, ctx) => {
					receivedUrl = req.url.toString();
					receivedMethod = req.method;
					receivedBody = await req.json();
					return res(ctx.status(200), ctx.json({ success: true, data: { matchedCount: 1, modifiedCount: 1, upsertedCount: 0, versioned: true, version: 3 } }));
				}),
			);

			const result = await konecty.upsertMeta('Contact', 'document', { icon: 'random', menuSorter: 1 });

			expect(receivedUrl).to.equal(`${ENDPOINT}/api/admin/meta/Contact/document`);
			expect(receivedMethod).to.equal('PUT');
			expect(receivedBody).to.deep.equal({ icon: 'random', menuSorter: 1 });
			expect(result.success === true && result.data.version).to.equal(3);
			expect(result.success === true && result.data.versioned).to.equal(true);
		});

		// Equivalent Python test: tests/test_admin.py::test_upsert_meta_reports_no_version_when_content_is_identical
		it('Should report versioned=false when the content is identical to the current state', async () => {
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-admin-auth-id' });

			server.use(
				rest.put(`${ENDPOINT}/api/admin/meta/:document/:type`, (req, res, ctx) =>
					res(ctx.status(200), ctx.json({ success: true, data: { matchedCount: 1, modifiedCount: 0, upsertedCount: 0, versioned: false, version: 3 } })),
				),
			);

			const result = await konecty.upsertMeta('Contact', 'document', { icon: 'random' });

			expect(result.success === true && result.data.versioned).to.equal(false);
		});

		// Equivalent Python test: tests/test_admin.py::test_upsert_meta_surfaces_the_read_only_config_code
		it('Should surface the 409 read-only-config code from a METADATA_DIR deployment', async () => {
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-admin-auth-id' });

			server.use(
				rest.put(`${ENDPOINT}/api/admin/meta/:document/:type`, (req, res, ctx) =>
					res(ctx.status(409), ctx.json({ success: false, errors: [{ message: 'Metadata is owned by the metadata directory', code: 'meta-admin-config-read-only' }] })),
				),
			);

			const result = await konecty.upsertMeta('Contact', 'document', {});

			expect(result.success).to.equal(false);
			expect(result.success === false && result.errors[0].code).to.equal('meta-admin-config-read-only');
		});

		// Equivalent Python test: tests/test_admin.py::test_upsert_meta_surfaces_the_requires_session_code
		it('Should surface the 403 requires-session code for a PAT or OAuth credential', async () => {
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-pat' });

			server.use(
				rest.put(`${ENDPOINT}/api/admin/meta/:document/:type`, (req, res, ctx) =>
					res(ctx.status(403), ctx.json({ success: false, errors: [{ message: 'requires a first-party session', code: 'admin-credential-routes-require-session' }] })),
				),
			);

			const result = await konecty.upsertMeta('Contact', 'document', {});

			expect(result.success === false && result.errors[0].code).to.equal('admin-credential-routes-require-session');
		});
	});

	describe('deleteMeta', () => {
		// Equivalent Python test: tests/test_admin.py::test_delete_meta_deletes_and_reports_the_version
		it('Should DELETE /api/admin/meta/:document/:type and report the version', async () => {
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-admin-auth-id' });
			let receivedMethod = '';

			server.use(
				rest.delete(`${ENDPOINT}/api/admin/meta/:document/:type`, (req, res, ctx) => {
					receivedMethod = req.method;
					return res(ctx.status(200), ctx.json({ success: true, data: { deletedCount: 1, version: 4 } }));
				}),
			);

			const result = await konecty.deleteMeta('Contact', 'document');

			expect(receivedMethod).to.equal('DELETE');
			expect(result.success === true && result.data.deletedCount).to.equal(1);
			expect(result.success === true && result.data.version).to.equal(4);
		});
	});

	describe('listMetaHistory', () => {
		// Equivalent Python test: tests/test_admin.py::test_list_meta_history_sends_limit_and_offset
		it('Should GET /api/admin/meta/:metaId/history with limit and offset in the query string', async () => {
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-admin-auth-id' });
			let receivedUrl = '';

			server.use(
				rest.get(`${ENDPOINT}/api/admin/meta/:metaId/history`, (req, res, ctx) => {
					receivedUrl = req.url.toString();
					return res(ctx.status(200), ctx.json({ success: true, data: [] }));
				}),
			);

			await konecty.listMetaHistory('Contact:list:Default', { limit: 10, offset: 20 });

			// `:` fica cru: o `yarl` do aiohttp normaliza `%3A` de volta para `:` no lado Python, e
			// encodá-lo aqui faria os dois SDKs mandarem bytes diferentes para o mesmo `_id`.
			// Espelhado em tests/test_admin.py::test_list_meta_history_sends_limit_and_offset, que
			// assevera o `raw_path` recebido pelo stub.
			expect(receivedUrl).to.equal(`${ENDPOINT}/api/admin/meta/Contact:list:Default/history?limit=10&offset=20`);
		});

		// Equivalent Python test: tests/test_admin.py::test_list_meta_history_omits_the_query_when_no_options
		it('Should omit the query string entirely when no options are given', async () => {
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-admin-auth-id' });
			let receivedUrl = '';

			server.use(
				rest.get(`${ENDPOINT}/api/admin/meta/:metaId/history`, (req, res, ctx) => {
					receivedUrl = req.url.toString();
					return res(ctx.status(200), ctx.json({ success: true, data: [] }));
				}),
			);

			await konecty.listMetaHistory('Contact');

			expect(receivedUrl).to.equal(`${ENDPOINT}/api/admin/meta/Contact/history`);
		});

		// Equivalent Python test: tests/test_admin.py::test_list_meta_history_returns_empty_for_a_meta_never_written
		it('Should return an empty list for a meta never written since deploy, not an error', async () => {
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-admin-auth-id' });

			server.use(rest.get(`${ENDPOINT}/api/admin/meta/:metaId/history`, (req, res, ctx) => res(ctx.status(200), ctx.json({ success: true, data: [] }))));

			const result = await konecty.listMetaHistory('Contact');

			// Ausência de histórico não é ausência de metadado — o consumidor precisa distinguir.
			expect(result.success).to.equal(true);
			expect(result.success === true && result.data).to.deep.equal([]);
		});
	});

	describe('rollbackMeta', () => {
		// Equivalent Python test: tests/test_admin.py::test_rollback_meta_posts_the_version_and_reports_the_new_one
		it('Should POST /api/admin/meta/:metaId/rollback with the version and report the new one', async () => {
			const konecty = new KonectyClient({ endpoint: ENDPOINT, accessKey: 'fake-admin-auth-id' });
			let receivedUrl = '';
			let receivedMethod = '';
			let receivedBody: unknown = null;

			server.use(
				rest.post(`${ENDPOINT}/api/admin/meta/:metaId/rollback`, async (req, res, ctx) => {
					receivedUrl = req.url.toString();
					receivedMethod = req.method;
					receivedBody = await req.json();
					return res(ctx.status(200), ctx.json({ success: true, data: { version: 5, restoredFrom: 2 } }));
				}),
			);

			const result = await konecty.rollbackMeta('Contact', 2);

			expect(receivedUrl).to.equal(`${ENDPOINT}/api/admin/meta/Contact/rollback`);
			expect(receivedMethod).to.equal('POST');
			expect(receivedBody).to.deep.equal({ version: 2 });
			// Forward-only: restaurar a v2 cria a v5 — não apaga a v3 nem a v4.
			expect(result.success === true && result.data.version).to.equal(5);
			expect(result.success === true && result.data.restoredFrom).to.equal(2);
		});
	});
});
