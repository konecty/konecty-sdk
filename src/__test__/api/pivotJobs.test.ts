import { KonectyClient, KonectyClientOptions, PivotJob, PivotJobError } from '@konecty/sdk/Client';
import { expect } from 'chai';
import { rest } from 'msw';
import { server } from '../../__test__/setup-test';

/*
 * Parity cases for the Python SDK (tests/test_pivot_jobs.py): same input, same URL/method/body.
 *
 * C1 create_pivot_job(PARAMS)             -> POST   /rest/pivot/jobs            body = PARAMS (JSON), Authorization = key
 * C2 get_pivot_job("job 1/x")             -> GET    /rest/pivot/jobs/job%201%2Fx
 * C3 list_pivot_jobs()                    -> GET    /rest/pivot/jobs            no body
 * C4 get_pivot_job_result("abc")          -> GET    /rest/pivot/jobs/abc/result
 * C5 cancel_pivot_job("abc")              -> DELETE /rest/pivot/jobs/abc        no body
 * C6 4xx on any call                      -> raises with "<status> - <statusText>"
 * C7 run_pivot_job: queued -> running -> done, sleeps [2000, 2000], result fetched once, on_progress called 3x
 * C8 run_pivot_job: elapsed >= 60 s       -> next sleep is 5000
 * C9 run_pivot_job: failed (error.code)   -> raises PivotJobError with code and job
 * C10 run_pivot_job: canceled             -> raises PivotJobError with code "canceled"
 * C11 run_pivot_job: abort while polling  -> DELETE /rest/pivot/jobs/:id sent, raises AbortError
 * C12 run_pivot_job: create answers done  -> no polling, no sleep, result fetched
 */

const BASE = 'http://localhost:3000';
const options: KonectyClientOptions = { endpoint: BASE, accessKey: 'fake-key' };

const PARAMS = {
	document: 'Opportunity',
	title: 'Funil',
	pivotConfig: { rows: [{ field: 'status' }], values: [{ field: '_id', aggregator: 'count' }] },
	filter: { match: 'and', conditions: [] },
	fields: 'status,_id',
};

const job = (over: Partial<PivotJob> = {}): PivotJob => ({
	_id: 'abc',
	userId: 'u1',
	document: 'Opportunity',
	title: 'Funil',
	request: PARAMS as PivotJob['request'],
	status: 'queued',
	stage: 'queued',
	processed: 0,
	total: null,
	truncated: false,
	cancelRequested: false,
	createdAt: '2026-11-04T00:00:00.000Z',
	...over,
});

type Seen = { method: string; url: string; body: unknown; auth: string | null };

describe('Konecty pivot jobs', () => {
	const seen: Seen[] = [];
	const record = (req: { method: string; url: URL; body: unknown; headers: Headers }) =>
		seen.push({ method: req.method, url: req.url.pathname, body: req.body, auth: req.headers.get('authorization') });

	beforeEach(() => {
		seen.length = 0;
	});

	it('C1 createPivotJob posts the params as JSON body', async () => {
		server.use(
			rest.post(`${BASE}/rest/pivot/jobs`, (req, res, ctx) => {
				record(req);
				return res(ctx.status(202), ctx.json({ job: job() }));
			}),
		);
		const result = await new KonectyClient(options).createPivotJob(PARAMS);
		expect(result._id).to.equal('abc');
		expect(seen).to.have.length(1);
		expect(seen[0].method).to.equal('POST');
		expect(seen[0].url).to.equal('/rest/pivot/jobs');
		expect(seen[0].body).to.deep.equal(PARAMS);
		expect(seen[0].auth).to.equal('fake-key');
	});

	it('C2 getPivotJob encodes the id', async () => {
		server.use(
			rest.get(`${BASE}/rest/pivot/jobs/:id`, (req, res, ctx) => {
				record(req);
				return res(ctx.json({ job: job({ _id: 'job 1/x' }) }));
			}),
		);
		const result = await new KonectyClient(options).getPivotJob('job 1/x');
		expect(result._id).to.equal('job 1/x');
		expect(seen[0].method).to.equal('GET');
		expect(seen[0].url).to.equal('/rest/pivot/jobs/job%201%2Fx');
	});

	it('C3 listPivotJobs returns the jobs array', async () => {
		server.use(
			rest.get(`${BASE}/rest/pivot/jobs`, (req, res, ctx) => {
				record(req);
				return res(ctx.json({ jobs: [job(), job({ _id: 'b' })] }));
			}),
		);
		const result = await new KonectyClient(options).listPivotJobs();
		expect(result.map(j => j._id)).to.deep.equal(['abc', 'b']);
		expect(seen[0].method).to.equal('GET');
		expect(seen[0].url).to.equal('/rest/pivot/jobs');
		expect(seen[0].body).to.be.oneOf(['', undefined, null]);
	});

	it('C4 getPivotJobResult returns the raw blob', async () => {
		server.use(
			rest.get(`${BASE}/rest/pivot/jobs/:id/result`, (req, res, ctx) => {
				record(req);
				return res(ctx.json({ rows: [], truncated: true, readCount: 7 }));
			}),
		);
		const result = await new KonectyClient(options).getPivotJobResult<{ rows: unknown[] }>('abc');
		expect(result.truncated).to.equal(true);
		expect(result.readCount).to.equal(7);
		expect(seen[0].method).to.equal('GET');
		expect(seen[0].url).to.equal('/rest/pivot/jobs/abc/result');
	});

	it('C5 cancelPivotJob sends DELETE without body', async () => {
		server.use(
			rest.delete(`${BASE}/rest/pivot/jobs/:id`, (req, res, ctx) => {
				record(req);
				return res(ctx.json({ job: job({ cancelRequested: true }) }));
			}),
		);
		const result = await new KonectyClient(options).cancelPivotJob('abc');
		expect(result.cancelRequested).to.equal(true);
		expect(seen[0].method).to.equal('DELETE');
		expect(seen[0].url).to.equal('/rest/pivot/jobs/abc');
		expect(seen[0].body).to.be.oneOf(['', undefined, null]);
	});

	it('C6 throws on 4xx with "<status> - <statusText>"', async () => {
		server.use(rest.get(`${BASE}/rest/pivot/jobs/:id`, (_req, res, ctx) => res(ctx.status(404), ctx.json({ success: false }))));
		try {
			await new KonectyClient(options).getPivotJob('nope');
			expect.fail('should have thrown');
		} catch (e) {
			expect((e as Error).message).to.include('404 - ');
		}
	});

	describe('runPivotJob', () => {
		const serve = (states: PivotJob[]) => {
			let i = 0;
			server.use(
				rest.post(`${BASE}/rest/pivot/jobs`, (req, res, ctx) => {
					record(req);
					return res(ctx.status(202), ctx.json({ job: states[0] }));
				}),
				rest.get(`${BASE}/rest/pivot/jobs/abc`, (req, res, ctx) => {
					record(req);
					i = Math.min(i + 1, states.length - 1);
					return res(ctx.json({ job: states[i] }));
				}),
				rest.get(`${BASE}/rest/pivot/jobs/abc/result`, (req, res, ctx) => {
					record(req);
					return res(ctx.json({ rows: [1], truncated: false, readCount: 1 }));
				}),
				rest.delete(`${BASE}/rest/pivot/jobs/abc`, (req, res, ctx) => {
					record(req);
					return res(ctx.json({ job: job({ cancelRequested: true }) }));
				}),
			);
		};

		it('C7 polls every 2 s until done, then fetches the result once', async () => {
			serve([
				job(),
				job({ status: 'running', stage: 'reading', processed: 5, total: 10 }),
				job({ status: 'done', stage: 'saving', processed: 10, total: 10 }),
			]);
			const sleeps: number[] = [];
			const progress: string[] = [];
			const { job: final, result } = await new KonectyClient(options).runPivotJob(PARAMS, {
				sleep: async ms => {
					sleeps.push(ms);
				},
				onProgress: j => progress.push(j.status),
			});
			expect(sleeps).to.deep.equal([2000, 2000]);
			expect(progress).to.deep.equal(['queued', 'running', 'done']);
			expect(final.status).to.equal('done');
			expect((result as { readCount: number }).readCount).to.equal(1);
			expect(seen.map(s => `${s.method} ${s.url}`)).to.deep.equal([
				'POST /rest/pivot/jobs',
				'GET /rest/pivot/jobs/abc',
				'GET /rest/pivot/jobs/abc',
				'GET /rest/pivot/jobs/abc/result',
			]);
		});

		it('C8 switches to 5 s after one minute', async () => {
			serve([job(), job({ status: 'running' }), job({ status: 'running' }), job({ status: 'done' })]);
			let clock = 0;
			const sleeps: number[] = [];
			await new KonectyClient(options).runPivotJob(PARAMS, {
				now: () => clock,
				sleep: async ms => {
					sleeps.push(ms);
					clock += ms === 2000 ? 60000 : ms;
				},
			});
			expect(sleeps).to.deep.equal([2000, 5000, 5000]);
		});

		it('C9 throws PivotJobError carrying code and job on failure', async () => {
			serve([job(), job({ status: 'failed', error: { code: 'too-many-cells', message: 'muitas células' } })]);
			try {
				await new KonectyClient(options).runPivotJob(PARAMS, { sleep: async () => undefined });
				expect.fail('should have thrown');
			} catch (e) {
				expect(e).to.be.instanceOf(PivotJobError);
				expect((e as PivotJobError).code).to.equal('too-many-cells');
				expect((e as PivotJobError).message).to.equal('muitas células');
				expect((e as PivotJobError).job.status).to.equal('failed');
			}
			expect(seen.some(s => s.url.endsWith('/result'))).to.equal(false);
		});

		it('C10 throws PivotJobError with code "canceled" when the job is canceled', async () => {
			serve([job(), job({ status: 'canceled' })]);
			try {
				await new KonectyClient(options).runPivotJob(PARAMS, { sleep: async () => undefined });
				expect.fail('should have thrown');
			} catch (e) {
				expect((e as PivotJobError).code).to.equal('canceled');
			}
		});

		it('C11 on abort sends DELETE and throws AbortError', async () => {
			serve([job(), job({ status: 'running' }), job({ status: 'running' })]);
			const controller = new AbortController();
			try {
				await new KonectyClient(options).runPivotJob(PARAMS, {
					signal: controller.signal,
					sleep: async () => controller.abort(),
				});
				expect.fail('should have thrown');
			} catch (e) {
				expect((e as Error).name).to.equal('AbortError');
			}
			expect(seen.map(s => `${s.method} ${s.url}`)).to.deep.equal(['POST /rest/pivot/jobs', 'DELETE /rest/pivot/jobs/abc']);
		});

		it('C12 does not poll when create already answers done', async () => {
			serve([job({ status: 'done' })]);
			const sleeps: number[] = [];
			const { job: final } = await new KonectyClient(options).runPivotJob(PARAMS, {
				sleep: async ms => void sleeps.push(ms),
			});
			expect(final.status).to.equal('done');
			expect(sleeps).to.deep.equal([]);
			expect(seen.map(s => `${s.method} ${s.url}`)).to.deep.equal([
				'POST /rest/pivot/jobs',
				'GET /rest/pivot/jobs/abc/result',
			]);
		});
	});
});
