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
