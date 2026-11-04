import fetch from 'isomorphic-fetch';

import logger from '../../lib/logger';
import type { CreatePivotJobParams, PivotJob, PivotJobErrorCode, PivotJobResult, RunPivotJobOptions } from '../types/pivot';

export type PivotJobsClientOptions = { endpoint: string; accessKey?: string };

export const PIVOT_JOB_POLL_FAST_MS = 2000;
export const PIVOT_JOB_POLL_SLOW_MS = 5000;
export const PIVOT_JOB_POLL_SLOW_AFTER_MS = 60000;

export class PivotJobError extends Error {
	readonly code: PivotJobErrorCode | 'canceled';
	readonly job: PivotJob;

	constructor(job: PivotJob) {
		const code = job.status === 'canceled' ? 'canceled' : job.error?.code ?? 'internal';
		super(job.error?.message ?? `pivot job ${job.status}`);
		this.name = 'PivotJobError';
		this.code = code;
		this.job = job;
	}
}

async function call<T>(opts: PivotJobsClientOptions, method: string, path: string, body?: unknown): Promise<T> {
	const url = `${opts.endpoint}${path}`;
	const headers: Record<string, string> = { Authorization: opts.accessKey ?? '' };
	if (body !== undefined) headers['Content-Type'] = 'application/json';
	const res = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
	if (res.status >= 400) {
		const errBody = await res.text();
		logger.error(`${res.status} ${res.statusText}`, { url, body: errBody });
		throw new Error(`${res.status} - ${res.statusText}`);
	}
	return res.json() as Promise<T>;
}

const jobPath = (id: string) => `/rest/pivot/jobs/${encodeURIComponent(id)}`;

/* POST /rest/pivot/jobs: 202 {job}, or 200 {job: done} on cache hit */
export async function createPivotJob(opts: PivotJobsClientOptions, params: CreatePivotJobParams): Promise<PivotJob> {
	const res = await call<{ job: PivotJob }>(opts, 'POST', '/rest/pivot/jobs', params);
	return res.job;
}

export async function getPivotJob(opts: PivotJobsClientOptions, id: string): Promise<PivotJob> {
	const res = await call<{ job: PivotJob }>(opts, 'GET', jobPath(id));
	return res.job;
}

export async function listPivotJobs(opts: PivotJobsClientOptions): Promise<PivotJob[]> {
	const res = await call<{ jobs: PivotJob[] }>(opts, 'GET', '/rest/pivot/jobs');
	return res.jobs;
}

export async function getPivotJobResult<T = unknown>(opts: PivotJobsClientOptions, id: string): Promise<PivotJobResult<T>> {
	return call<PivotJobResult<T>>(opts, 'GET', `${jobPath(id)}/result`);
}

export async function cancelPivotJob(opts: PivotJobsClientOptions, id: string): Promise<PivotJob> {
	const res = await call<{ job: PivotJob }>(opts, 'DELETE', jobPath(id));
	return res.job;
}

const defaultSleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

function abortError(): Error {
	const err = new Error('The operation was aborted');
	err.name = 'AbortError';
	return err;
}

/*
 * Creates the job and polls it every 2 s (5 s after 1 minute) until it ends.
 * done -> resolves with {job, result}; failed/canceled -> throws PivotJobError;
 * aborted -> sends DELETE on the job (best effort) and throws AbortError.
 */
export async function runPivotJob<T = unknown>(
	opts: PivotJobsClientOptions,
	params: CreatePivotJobParams,
	{ onProgress, signal, sleep = defaultSleep, now = Date.now }: RunPivotJobOptions = {},
): Promise<{ job: PivotJob; result: PivotJobResult<T> }> {
	if (signal?.aborted) throw abortError();
	const startedAt = now();
	let job = await createPivotJob(opts, params);
	onProgress?.(job);

	while (job.status === 'queued' || job.status === 'running') {
		if (signal?.aborted) {
			await cancelPivotJob(opts, job._id).catch(() => undefined);
			throw abortError();
		}
		await sleep(now() - startedAt >= PIVOT_JOB_POLL_SLOW_AFTER_MS ? PIVOT_JOB_POLL_SLOW_MS : PIVOT_JOB_POLL_FAST_MS);
		if (signal?.aborted) {
			await cancelPivotJob(opts, job._id).catch(() => undefined);
			throw abortError();
		}
		job = await getPivotJob(opts, job._id);
		onProgress?.(job);
	}

	if (job.status !== 'done') throw new PivotJobError(job);
	const result = await getPivotJobResult<T>(opts, job._id);
	return { job, result };
}
