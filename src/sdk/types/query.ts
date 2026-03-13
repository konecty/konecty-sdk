/**
 * KPI aggregation config for GET /rest/data/:document/kpi.
 * field is required when operation is not 'count' (e.g. sum, avg, min, max, countDistinct).
 */
export type KpiConfig = {
	operation: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'countDistinct';
	field?: string;
};

export type KpiResult = {
	success: true;
	value: number;
	count: number;
};
