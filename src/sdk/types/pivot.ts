/**
 * Minimal PivotConfig for GET /rest/data/:document/pivot.
 * rows and values are required non-empty arrays. See CRM src/imports/types/pivot.ts for full structure.
 */
export type PivotConfig = {
	rows: Array<{ field: string; order?: string; showSubtotal?: boolean }>;
	values: Array<{ field: string; aggregator: string }>;
	columns?: Array<{ field: string; order?: string; format?: string; aggregator?: string }>;
	options?: { showRowGrandTotals?: boolean; showColGrandTotals?: boolean; showSubtotals?: boolean };
	[key: string]: unknown;
};

/* Pivot jobs (POST/GET/DELETE /rest/pivot/jobs): mirrors the PivotJob collection of the server design. */
export type PivotJobStatus = 'queued' | 'running' | 'done' | 'failed' | 'canceled';
export type PivotJobStage = 'queued' | 'counting' | 'reading' | 'aggregating' | 'saving';
export type PivotJobErrorCode = 'interrupted' | 'too-many-cells' | 'python-memory' | 'timeout' | 'internal';

export type PivotJobRequest = {
	document: string;
	pivotConfig: PivotConfig;
	filter?: unknown;
	displayName?: string;
	displayType?: string;
	fields?: Array<string> | string;
};

export type CreatePivotJobParams = PivotJobRequest & { title?: string };

export type PivotJob = {
	_id: string;
	userId: string;
	document: string;
	title: string;
	request: PivotJobRequest;
	status: PivotJobStatus;
	stage: PivotJobStage;
	processed: number;
	/* null = count timed out: indeterminate progress */
	total: number | null;
	truncated: boolean;
	error?: { code: PivotJobErrorCode; message: string };
	cancelRequested: boolean;
	podId?: string;
	heartbeatAt?: string;
	createdAt: string;
	finishedAt?: string;
	expiresAt?: string;
};

export type PivotJobResult<T = unknown> = T & { truncated?: boolean; readCount?: number };

export type RunPivotJobOptions = {
	onProgress?: (job: PivotJob) => void;
	signal?: AbortSignal;
	/* test hooks: polling is 2 s, switching to 5 s after 1 min */
	sleep?: (ms: number) => Promise<void>;
	now?: () => number;
};
